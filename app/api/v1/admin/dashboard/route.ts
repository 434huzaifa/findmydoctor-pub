import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import {
  getDataSource,
  Appointment,
  Doctor,
  Medicine,
  Ambulance,
  HomeVisitRequest,
  VirtualConsultation,
} from "@/server/db/data-source";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");

    const ds = await getDataSource();

    const [
      doctors,
      appointmentRows,
      medicines,
      ambulances,
      homeVisits,
      consultations,
    ] = await Promise.all([
      ds.getRepository(Doctor).count(),
      ds.getRepository(Appointment).find(),
      ds.getRepository(Medicine).count(),
      ds.getRepository(Ambulance).count(),
      ds.getRepository(HomeVisitRequest).count(),
      ds.getRepository(VirtualConsultation).count(),
    ]);

    const revenue = appointmentRows.reduce(
      (sum, a) => sum + (a.fee ?? 0),
      0
    );

    return ok({
      doctors,
      appointments: appointmentRows.length,
      revenue,
      medicines,
      ambulances,
      homeVisits,
      consultations,
    });
  } catch (e) {
    return handleError(e);
  }
}
