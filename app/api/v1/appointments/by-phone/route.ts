
import { NextRequest } from "next/server";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { verifyOtpToken } from "@/server/lib/otp-store";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone")?.trim() ?? "";
    const otpToken = req.nextUrl.searchParams.get("otpToken")?.trim() ?? "";
    if (!phone) throw new AppError("phone query is required", 400, "BAD_REQUEST");
    if (!otpToken || !verifyOtpToken(phone, otpToken)) throw new AppError("OTP verification required", 401, "UNAUTHORIZED");
    const ds = await getDataSource();
    const list = await ds.getRepository(Appointment)
      .createQueryBuilder("apt")
      .innerJoin("doctors", "doc", "doc.id = apt.doctorId")
      .leftJoin("specialties", "sp", "sp.id = doc.specialtyId")
      .where("apt.patientPhone = :phone", { phone })
      .orderBy("apt.appointmentDate", "DESC")
      .addOrderBy("apt.createdAt", "DESC")
      .select([
        "apt.id as id", "apt.doctorId as \"doctorId\"", "apt.patientName as \"patientName\"",
        "apt.patientPhone as \"patientPhone\"", "apt.appointmentDate as \"appointmentDate\"",
        "apt.slot as slot", "apt.fee as fee", "apt.status as status",
        "apt.paymentMethod as \"paymentMethod\"", "apt.paymentStatus as \"paymentStatus\"",
        "apt.paidAmount as \"paidAmount\"", "apt.paidAt as \"paidAt\"", "apt.createdAt as \"createdAt\"",
        "doc.name as \"doctorName\"", "sp.name as \"doctorSpec\"", "sp.icon as \"doctorSpecIcon\"",
        "doc.hospital as \"doctorHospital\"",
      ])
      .getRawMany();
    return ok(list);
  } catch (e) { return handleError(e); }
}
