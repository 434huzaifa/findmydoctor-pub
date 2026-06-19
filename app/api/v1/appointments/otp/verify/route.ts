
import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { OTP_CODE, OTP_TTL_MS, issueOtpToken } from "@/server/lib/otp-store";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = z.object({ phone: z.string().min(5), otp: z.string().min(4) }).parse(await req.json());
    if (otp !== OTP_CODE) throw new AppError("Invalid OTP", 401, "INVALID_OTP");
    const token = issueOtpToken(phone);
    return ok({ otpToken: token, expiresInSec: OTP_TTL_MS / 1000 });
  } catch (e) { return handleError(e); }
}
