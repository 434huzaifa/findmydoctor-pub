import { NextRequest } from "next/server";
import { Not, IsNull } from "typeorm";
import { ok } from "@/server/lib/response";
import { err } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Doctor } from "@/server/db/entities/Doctor";
import { computeNextAppointment } from "@/server/lib/rrule-next";
import { handleError } from "@/server/lib/handle-error";
import { env } from "@/server/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret when set
    if (env.CRON_SECRET) {
      const authHeader = req.headers.get("authorization") ?? "";
      if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return err("Unauthorized", "UNAUTHORIZED", 401);
      }
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Doctor);
    const doctors = await repo.find({
      where: { rrule: Not(IsNull()) },
    });

    const withRrule = doctors.filter((d) => d.rrule && d.chamberOpenTime);

    let updated = 0;
    for (const doctor of withRrule) {
      const next = computeNextAppointment(
        doctor.rrule!,
        doctor.chamberOpenTime!,
      );
      doctor.nextAppointment = next;
      await repo.save(doctor);
      updated++;
    }

    return ok({ updated });
  } catch (e) {
    return handleError(e);
  }
}
