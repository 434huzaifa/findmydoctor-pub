
import { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/server/lib/response";
import { OTP_CODE, OTP_TTL_MS } from "@/server/lib/otp-store";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  try {
    const { phone } = z.object({ phone: z.string().min(5) }).parse(await req.json());
    return ok({ phone, otpHint: OTP_CODE, expiresInSec: OTP_TTL_MS / 1000 });
  } catch (e) { return handleError(e); }
}
