
import { NextRequest } from "next/server";
import { getAuthUser } from "@/server/lib/auth-guard";
import { requireRole } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import type { ApiAppointment } from "@/types/domain";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req); requireRole(user, "admin");
    const ds = await getDataSource();
    const appointments = await ds.getRepository<ApiAppointment>("appointments").find();
    const doctors = await ds.getRepository("doctors").count();
    const revenue = appointments.reduce((s, a) => s + a.fee, 0);
    return ok({ doctors, appointments: appointments.length, revenue });
  } catch (e) { return handleError(e); }
}
