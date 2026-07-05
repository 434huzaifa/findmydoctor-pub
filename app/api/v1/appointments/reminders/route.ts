import { NextRequest } from "next/server";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { verifyOtpToken } from "@/server/lib/otp-store";
import { getDataSource } from "@/server/db/data-source";
import { Notification } from "@/server/db/entities/Notification";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone")?.trim() ?? "";
    const otpToken = req.nextUrl.searchParams.get("otpToken")?.trim() ?? "";
    if (!phone) throw new AppError("phone query is required", 400, "BAD_REQUEST");
    if (!otpToken || !verifyOtpToken(phone, otpToken))
      throw new AppError("OTP verification required", 401, "UNAUTHORIZED");

    const ds = await getDataSource();
    const items = await ds.getRepository(Notification).find({
      where: { recipientPhone: phone, targetType: "appointment" },
      order: { scheduledFor: "DESC" },
      take: 20,
    });

    return ok(items);
  } catch (e) {
    return handleError(e);
  }
}
