import { NextRequest } from "next/server";
import { LessThan } from "typeorm";
import { ok, err } from "@/server/lib/response";
import { getDataSource, Ambulance, AmbulanceDispatch } from "@/server/db/data-source";
import { DispatchStatus } from "@/server/db/entities/AmbulanceDispatch";
import { handleError } from "@/server/lib/handle-error";
import { env } from "@/server/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    if (env.CRON_SECRET) {
      const authHeader = req.headers.get("authorization") ?? "";
      if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return err("Unauthorized", "UNAUTHORIZED", 401);
      }
    }

    const ds = await getDataSource();
    const dispatchRepo = ds.getRepository(AmbulanceDispatch);
    const ambulanceRepo = ds.getRepository(Ambulance);

    const expired = await dispatchRepo.find({
      where: { status: DispatchStatus.DISPATCHED, endTime: LessThan(new Date()) },
    });

    let expiredCount = 0;
    for (const dispatch of expired) {
      dispatch.status = DispatchStatus.COMPLETED;
      await dispatchRepo.save(dispatch);
      await ambulanceRepo.update(dispatch.ambulanceId, { isAvailable: true });
      expiredCount++;
    }

    return ok({ expired: expiredCount });
  } catch (e) {
    return handleError(e);
  }
}
