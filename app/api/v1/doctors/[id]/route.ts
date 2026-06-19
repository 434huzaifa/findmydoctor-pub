
import { NextRequest } from "next/server";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { AppError } from "@/server/lib/app-error";
import { handleError } from "@/server/lib/handle-error";
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
