
import { NextRequest } from "next/server";
import { z } from "zod";
import { getDataSource } from "@/server/db/data-source";
import { Doctor } from "@/server/db/entities/Doctor";
import { Appointment } from "@/server/db/entities/Appointment";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const schema = z.object({
  doctorId: z.coerce.number().int().positive(), patientName: z.string().min(1),
  patientPhone: z.string().min(5), appointmentDate: z.string().min(1),
  slot: z.string().min(1), paymentMethod: z.enum(["online","cash"]).default("online"),
  paymentChoice: z.enum(["full","advance"]).optional(),
});
export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ds = await getDataSource();
    const doctorRepo = ds.getRepository(Doctor);
    const aptRepo = ds.getRepository(Appointment);
    const doctor = await doctorRepo.findOne({ where: { id: body.doctorId } });
    if (!doctor) throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    if (doctor.usedSeats >= doctor.totalSeats) throw new AppError("Doctor has no available seats", 409, "NO_SEAT_AVAILABLE");
    const hasAdvanceRule = doctor.advanceFee > 0;
    if (hasAdvanceRule && body.paymentMethod === "cash") throw new AppError("Cash booking is not allowed for this doctor", 400, "BAD_REQUEST");
    if (hasAdvanceRule && !body.paymentChoice) throw new AppError("paymentChoice is required for this doctor", 400, "BAD_REQUEST");
    doctor.usedSeats += 1;
    await doctorRepo.save(doctor);
    const resolvedChoice: "full" | "advance" = hasAdvanceRule ? (body.paymentChoice as "full" | "advance") : "full";
    const isCash = body.paymentMethod === "cash";
    const paidAmount = isCash ? null : resolvedChoice === "advance" ? doctor.advanceFee : doctor.fee;
    const amountDue = paidAmount == null ? doctor.fee : Math.max(doctor.fee - paidAmount, 0);
    const paymentStatus: "paid" | "unpaid" | "partial" = paidAmount == null ? "unpaid" : amountDue > 0 ? "partial" : "paid";
    const appointment = aptRepo.create({
      doctorId: doctor.id, userId: null, patientName: body.patientName, patientPhone: body.patientPhone,
      appointmentDate: body.appointmentDate, slot: body.slot, fee: doctor.fee, status: "confirmed",
      paymentMethod: body.paymentMethod, paymentChoice: resolvedChoice, paymentStatus, paidAmount, amountDue,
      paidAt: paidAmount == null ? null : new Date(), paidByUserId: null,
    });
    return ok(await aptRepo.save(appointment), 201);
  } catch (e) { return handleError(e); }
}
