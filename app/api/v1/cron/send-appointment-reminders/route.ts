import { NextRequest } from "next/server";
import dayjs from "dayjs";
import { ok, err } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { Notification } from "@/server/db/entities/Notification";
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

    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

    const ds = await getDataSource();
    const appointments = await ds.getRepository(Appointment).find({
      where: { appointmentDate: tomorrow, status: "confirmed" },
      relations: { doctor: true },
    });

    const notifRepo = ds.getRepository(Notification);
    let created = 0;
    for (const apt of appointments) {
      const exists = await notifRepo.findOne({
        where: { targetType: "appointment", targetId: apt.id },
      });
      if (exists) continue;

      await notifRepo.save(
        notifRepo.create({
          channel: "inapp",
          targetType: "appointment",
          targetId: apt.id,
          recipientPhone: apt.patientPhone,
          message: `Reminder: you have an appointment with ${apt.doctor.name} tomorrow (${apt.appointmentDate}) at ${apt.slot}.`,
          status: "sent",
          scheduledFor: new Date(),
          sentAt: new Date(),
        })
      );
      created++;
    }

    return ok({ created });
  } catch (e) {
    return handleError(e);
  }
}
