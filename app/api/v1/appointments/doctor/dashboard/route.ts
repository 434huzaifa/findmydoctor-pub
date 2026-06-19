
import { NextRequest } from "next/server";
import { AppError } from "@/server/lib/app-error";
import { getAuthUser } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const sp = req.nextUrl.searchParams;
    let from = sp.get("from") ?? undefined;
    let to = sp.get("to") ?? undefined;
    if (!from && !to) { const today = new Date().toISOString().slice(0, 10); from = today; to = today; }
    let doctorId: number;
    if (user.role === "doctor") {
      if (!user.doctorId) throw new AppError("Doctor account not linked", 400, "BAD_REQUEST");
      doctorId = user.doctorId;
    } else if (user.role === "admin") {
      const rawDoctorId = sp.get("doctorId");
      doctorId = Number(rawDoctorId);
      if (!Number.isInteger(doctorId) || doctorId <= 0)
        throw new AppError("doctorId query is required", 400, "BAD_REQUEST");
    } else throw new AppError("Forbidden", 403, "FORBIDDEN");
    const ds = await getDataSource();
    const qb = ds.getRepository(Appointment).createQueryBuilder("apt").where("apt.doctorId = :doctorId", { doctorId });
    if (from) qb.andWhere("apt.appointmentDate >= :from", { from });
    if (to) qb.andWhere("apt.appointmentDate <= :to", { to });
    const items = await qb.orderBy("apt.appointmentDate","DESC").addOrderBy("apt.createdAt","DESC").getMany();
    const summary = items.reduce((acc, item) => {
      acc.totalAppointments += 1; acc.expectedAmount += item.fee;
      if (item.paymentStatus === "paid") { acc.paidAppointments += 1; acc.totalPaid += item.paidAmount ?? item.fee; }
      else if (item.paymentStatus === "partial") { acc.partialAppointments += 1; acc.totalPaid += item.paidAmount ?? 0; }
      else acc.unpaidAppointments += 1;
      return acc;
    }, { totalAppointments: 0, paidAppointments: 0, partialAppointments: 0, unpaidAppointments: 0, expectedAmount: 0, totalPaid: 0 });
    return ok({ summary, items });
  } catch (e) { return handleError(e); }
}
