import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Doctor } from "@/server/db/entities/Doctor";
import { Specialty } from "@/server/db/entities/Specialty";
import { User } from "@/server/db/entities/User";
import { computeNextAppointment } from "@/server/lib/rrule-next";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const doctorSchema = z.object({
  name: z.string().min(1),
  specialtyId: z.number().int().positive(),
  hospital: z.string().min(1),
  city: z.string().min(1),
  exp: z.number().int().nonnegative(),
  fee: z.number().int().nonnegative(),
  advanceFee: z.number().int().nonnegative().default(0),
  totalSeats: z.number().int().positive(),
  usedSeats: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5).default(4.5),
  degrees: z.string().default(""),
  chamberAddress: z.string().optional().nullable(),
  rrule: z.string().optional().nullable(),
  chamberOpenTime: z.string().optional().nullable(),
  chamberCloseTime: z.string().optional().nullable(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const ds = await getDataSource();
    return ok(
      await ds.getRepository(Doctor).find({
        relations: { specialty: true },
        order: { createdAt: "ASC" },
      }),
    );
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const body = doctorSchema.parse(await req.json());
    const ds = await getDataSource();

    const specialty = await ds
      .getRepository(Specialty)
      .findOne({ where: { id: body.specialtyId } });
    if (!specialty) throw new AppError("Specialty not found", 404, "NOT_FOUND");

    const { email, password, ...doctorFields } = body;

    let nextAppointment: Date | null = null;
    if (doctorFields.rrule && doctorFields.chamberOpenTime) {
      nextAppointment = computeNextAppointment(
        doctorFields.rrule,
        doctorFields.chamberOpenTime,
      );
    }

    const repo = ds.getRepository(Doctor);
    const saved = await repo.save(
      repo.create({ ...doctorFields, nextAppointment }),
    );

    if (email && password) {
      const userRepo = ds.getRepository(User);
      const existingUser = await userRepo.findOne({ where: { email } });
      if (existingUser)
        throw new AppError(
          "A user with that email already exists",
          409,
          "CONFLICT",
        );
      const hash = await bcrypt.hash(password, 10);
      await userRepo.save(
        userRepo.create({
          email,
          password: hash,
          role: "doctor",
          doctorId: saved.id,
        }),
      );
    }

    return ok(
      await repo.findOne({
        where: { id: saved.id },
        relations: { specialty: true },
      }),
      201,
    );
  } catch (e) {
    return handleError(e);
  }
}
