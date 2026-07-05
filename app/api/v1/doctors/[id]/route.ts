
import { NextRequest } from "next/server";
import { z } from "zod";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { AppError } from "@/server/lib/app-error";
import { handleError } from "@/server/lib/handle-error";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { computeNextAppointment } from "@/server/lib/rrule-next";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0)
      throw new AppError("Invalid doctor id", 400, "BAD_REQUEST");
    const ds = await getDataSource();
    const doctor = await ds.getRepository(Doctor).findOne({ where: { id }, relations: { specialty: true } });
    if (!doctor) throw new AppError("Doctor not found", 404, "NOT_FOUND");
    return ok(doctor);
  } catch (e) { return handleError(e); }
}

const selfServicePartial = z.object({
  name: z.string().min(1).optional(),
  hospital: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  exp: z.number().int().nonnegative().optional(),
  fee: z.number().int().nonnegative().optional(),
  advanceFee: z.number().int().nonnegative().optional(),
  degrees: z.string().optional(),
  chamberAddress: z.string().optional().nullable(),
  roomNumber: z.string().optional().nullable(),
  rrule: z.string().optional().nullable(),
  chamberOpenTime: z.string().optional().nullable(),
  chamberCloseTime: z.string().optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "doctor");
    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0)
      throw new AppError("Invalid doctor id", 400, "BAD_REQUEST");
    if (user.doctorId !== id)
      throw new AppError("Forbidden", 403, "FORBIDDEN");

    const body = selfServicePartial.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository(Doctor);
    const existing = await repo.findOne({ where: { id } });
    if (!existing) throw new AppError("Doctor not found", 404, "NOT_FOUND");

    Object.assign(existing, body);

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
