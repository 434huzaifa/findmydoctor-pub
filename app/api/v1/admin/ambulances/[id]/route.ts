import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { getDataSource, Ambulance } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH — update an ambulance */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");

    const { id } = await params;
    const body = await req.json();

    const ds = await getDataSource();
    const repo = ds.getRepository(Ambulance);

    const ambulance = await repo.findOne({ where: { id: parseInt(id) } });
    if (!ambulance) return notFound("Ambulance not found");

    // Update allowed fields
    if (body.vehicleNumber !== undefined)
      ambulance.vehicleNumber = body.vehicleNumber;
    if (body.driverName !== undefined) ambulance.driverName = body.driverName;
    if (body.driverPhone !== undefined)
      ambulance.driverPhone = body.driverPhone;
    if (body.baseLocation !== undefined)
      ambulance.baseLocation = body.baseLocation;
    if (typeof body.isAvailable === "boolean")
      ambulance.isAvailable = body.isAvailable;

    await repo.save(ambulance);
    return ok(ambulance);
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE — remove an ambulance */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");

    const { id } = await params;

    const ds = await getDataSource();
    const repo = ds.getRepository(Ambulance);

    const ambulance = await repo.findOne({ where: { id: parseInt(id) } });
    if (!ambulance) return notFound("Ambulance not found");

    await repo.remove(ambulance);
    return ok({ deleted: true });
  } catch (e) {
    return handleError(e);
  }
}
