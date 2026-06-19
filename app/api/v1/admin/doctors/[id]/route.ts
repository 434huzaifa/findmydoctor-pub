import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Doctor } from "@/server/db/entities/Doctor";
import { Specialty } from "@/server/db/entities/Specialty";
import { computeNextAppointment } from "@/server/lib/rrule-next";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const partial = z.object({
  name: z.string().min(1).optional(),
  specialtyId: z.number().int().positive().optional(),
  hospital: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  exp: z.number().int().nonnegative().optional(),
  fee: z.number().int().nonnegative().optional(),
  advanceFee: z.number().int().nonnegative().optional(),
  totalSeats: z.number().int().positive().optional(),
  usedSeats: z.number().int().nonnegative().optional(),
  rating: z.number().min(0).max(5).optional(),
  degrees: z.string().optional(),
  chamberAddress: z.string().optional().nullable(),
  rrule: z.string().optional().nullable(),
  chamberOpenTime: z.string().optional().nullable(),
  chamberCloseTime: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0)
      throw new AppError("Invalid doctor id", 400, "BAD_REQUEST");
    const body = partial.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository(Doctor);
    const existing = await repo.findOne({ where: { id } });
    if (!existing)
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    if (body.specialtyId) {
      const sp = await ds
        .getRepository(Specialty)
        .findOne({ where: { id: body.specialtyId } });
      if (!sp) throw new AppError("Specialty not found", 404, "NOT_FOUND");
    }
    Object.assign(existing, body);

    // Recompute nextAppointment whenever rrule or openTime changes
    const effectiveRrule = existing.rrule;
    const effectiveOpenTime = existing.chamberOpenTime;
    if (effectiveRrule && effectiveOpenTime) {
      existing.nextAppointment = computeNextAppointment(
        effectiveRrule,
        effectiveOpenTime,
      );
    }

    const saved = await repo.save(existing);
    return ok(
      await repo.findOne({
        where: { id: saved.id },
        relations: { specialty: true },
      }),
    );
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0)
      throw new AppError("Invalid doctor id", 400, "BAD_REQUEST");
    const ds = await getDataSource();
    const repo = ds.getRepository(Doctor);
    const existing = await repo.findOne({ where: { id } });
    if (!existing)
      throw new AppError("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    await repo.remove(existing);
    return ok({ message: "Doctor deleted" });
  } catch (e) {
    return handleError(e);
  }
}
