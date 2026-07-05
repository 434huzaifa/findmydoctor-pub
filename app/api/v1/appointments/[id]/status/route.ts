import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError } from "@/server/lib/app-error";
import { getAuthUser } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  status: z.enum(["confirmed", "completed", "cancelled", "no_show"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0)
      throw new AppError("Invalid appointment id", 400, "BAD_REQUEST");
    const { status } = bodySchema.parse(await req.json());

    const ds = await getDataSource();
    const repo = ds.getRepository(Appointment);
    const apt = await repo.findOne({ where: { id } });
    if (!apt) throw new AppError("Appointment not found", 404, "NOT_FOUND");

    let doctorId: number;
    if (user.role === "doctor") {
      if (!user.doctorId) throw new AppError("Not linked", 400, "BAD_REQUEST");
      doctorId = user.doctorId;
    } else if (user.role === "admin") {
      const rawDoctorId = req.nextUrl.searchParams.get("doctorId");
      doctorId = Number(rawDoctorId);
      if (!Number.isInteger(doctorId) || doctorId <= 0)
        throw new AppError("doctorId required", 400, "BAD_REQUEST");
    } else throw new AppError("Forbidden", 403, "FORBIDDEN");
    if (apt.doctorId !== doctorId) throw new AppError("Forbidden", 403, "FORBIDDEN");

    apt.status = status;
    apt.completedAt = status === "completed" ? new Date() : apt.completedAt;

    return ok(await repo.save(apt));
  } catch (e) {
    return handleError(e);
  }
}
