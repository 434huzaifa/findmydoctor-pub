import { NextRequest } from "next/server";
import {
  getDataSource,
  Ambulance,
  AmbulanceDispatch,
} from "@/server/db/data-source";
import { ok, badRequest, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ambulanceId, callerName, callerPhone, pickupLocation } = body;

    if (!ambulanceId || !callerName || !callerPhone || !pickupLocation) {
      return badRequest(
        "ambulanceId, callerName, callerPhone, and pickupLocation are required"
      );
    }

    const ds = await getDataSource();
    const ambulanceRepo = ds.getRepository(Ambulance);
    const dispatchRepo = ds.getRepository(AmbulanceDispatch);

    // Check ambulance exists and is available
    const ambulance = await ambulanceRepo.findOne({
      where: { id: ambulanceId },
    });

    if (!ambulance) {
      return notFound("Ambulance not found");
    }

    if (!ambulance.isAvailable) {
      return badRequest("Ambulance is not available");
    }

    // Create dispatch record
    const dispatch = dispatchRepo.create({
      ambulanceId,
      callerName,
      callerPhone,
      pickupLocation,
    });

    await dispatchRepo.save(dispatch);

    // Mark ambulance as unavailable
    await ambulanceRepo.update(ambulanceId, { isAvailable: false });

    // Fetch with relation
    const savedDispatch = await dispatchRepo.findOne({
      where: { id: dispatch.id },
      relations: ["ambulance"],
    });

    return ok(savedDispatch, 201);
  } catch (e) {
    return handleError(e);
  }
}
