
import { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/server/lib/response";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/server/lib/jwt";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().min(1) }).parse(await req.json());
    const payload = verifyRefreshToken(refreshToken);
    return ok({ accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) });
  } catch (e) { return handleError(e); }
}
