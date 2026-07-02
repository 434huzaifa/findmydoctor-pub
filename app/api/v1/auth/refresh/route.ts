
import { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/server/lib/response";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/server/lib/jwt";
import { isTokenRevoked, revokeToken } from "@/server/lib/token-denylist";
import { AppError } from "@/server/lib/app-error";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(await req.json());
    const decoded = verifyRefreshToken(refreshToken);
    if (await isTokenRevoked(decoded.jti)) {
      throw new AppError("Session expired. Please sign in again", 401, "TOKEN_EXPIRED");
    }
    const { id, email, role, doctorId } = decoded;
    const payload = { id, email, role, doctorId };
    const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    await revokeToken(decoded.jti, remainingSeconds);
    return ok({ accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) });
  } catch (e) { return handleError(e); }
}
