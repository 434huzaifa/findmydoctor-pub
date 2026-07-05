import { NextRequest } from "next/server";
import { z } from "zod";
import {
  getDataSource,
  Ambulance,
  AmbulanceDispatch,
} from "@/server/db/data-source";
import { ok, badRequest, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { computeCost } from "@/modules/ambulance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z
  .object({
    ambulanceId: z.number().int().positive(),
    callerName: z.string().min(1),
    callerPhone: z.string().min(1),
    pickupLocation: z.string().min(1),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((b) => b.endTime.getTime() - b.startTime.getTime() >= 60 * 60 * 1000, {
    message: "Minimum booking duration is 1 hour",
    path: ["endTime"],
  });

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid input");
    }
    const { ambulanceId, callerName, callerPhone, pickupLocation, startTime, endTime } =
      parsed.data;

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

    const totalCost = computeCost(ambulance.hourlyRate, startTime, endTime);

    // Create dispatch record
    const dispatch = dispatchRepo.create({
      ambulanceId,
      callerName,
      callerPhone,
      pickupLocation,
      startTime,
      endTime,
      totalCost,
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
