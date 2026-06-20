import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { getDataSource, Ambulance } from "@/server/db/data-source";
import { ok, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — list all ambulances for admin */
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");

    const ds = await getDataSource();
    const ambulances = await ds.getRepository(Ambulance).find({
      order: { id: "ASC" },
    });

    return ok(ambulances);
  } catch (e) {
    return handleError(e);
  }
}

/** POST — create a new ambulance */
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");

    const body = await req.json();
    const { vehicleNumber, driverName, driverPhone, baseLocation } = body;

    if (!vehicleNumber || !driverName || !driverPhone || !baseLocation) {
      return badRequest(
        "vehicleNumber, driverName, driverPhone, and baseLocation are required"
      );
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Ambulance);

    const ambulance = repo.create({
      vehicleNumber,
      driverName,
      driverPhone,
      baseLocation,
      isAvailable: true,
    });

    await repo.save(ambulance);
    return ok(ambulance, 201);
  } catch (e) {
    return handleError(e);
  }
}
