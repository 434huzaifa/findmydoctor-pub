import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { verifyOtpToken } from "@/server/lib/otp-store";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { Doctor } from "@/server/db/entities/Doctor";
import { Review } from "@/server/db/entities/Review";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  appointmentId: z.number().int().positive(),
  phone: z.string().min(5),
  otpToken: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

async function recomputeDoctorRating(doctorId: number) {
  const ds = await getDataSource();
  const { avg } = await ds
    .getRepository(Review)
    .createQueryBuilder("review")
    .select("AVG(review.rating)", "avg")
    .where("review.doctorId = :doctorId", { doctorId })
    .getRawOne<{ avg: string | null }>()
    .then((r) => r ?? { avg: null });

  await ds
    .getRepository(Doctor)
    .update(doctorId, { rating: avg ? Math.round(parseFloat(avg) * 10) / 10 : 0 });
}

export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());

    if (!verifyOtpToken(body.phone, body.otpToken)) {
      throw new AppError("OTP verification required", 401, "UNAUTHORIZED");
    }

    const ds = await getDataSource();
    const appointmentRepo = ds.getRepository(Appointment);
    const reviewRepo = ds.getRepository(Review);

    const appointment = await appointmentRepo.findOne({
      where: { id: body.appointmentId },
    });
    if (!appointment) {
      throw new AppError("Appointment not found", 404, "NOT_FOUND");
    }
    if (appointment.patientPhone !== body.phone) {
      throw new AppError("Phone does not match this appointment", 403, "FORBIDDEN");
    }
    if (appointment.status !== "completed") {
      throw new AppError(
        "Only completed appointments can be reviewed",
        400,
        "NOT_COMPLETED"
      );
    }

    const existing = await reviewRepo.findOne({
      where: { appointmentId: body.appointmentId },
    });
    if (existing) {
      throw new AppError("This appointment has already been reviewed", 409, "ALREADY_REVIEWED");
    }

    const review = reviewRepo.create({
      appointmentId: appointment.id,
      doctorId: appointment.doctorId,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      rating: body.rating,
      comment: body.comment?.trim() || null,
    });
    await reviewRepo.save(review);

    await recomputeDoctorRating(appointment.doctorId);

    return ok(review, 201);
  } catch (e) {
    return handleError(e);
  }
}
