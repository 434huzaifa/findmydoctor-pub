import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUserToken } from "@/server/lib/auth-guard";
import { verifyRefreshToken } from "@/server/lib/jwt";
import { revokeToken } from "@/server/lib/token-denylist";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ refreshToken: z.string().min(1).optional() });

export async function POST(req: NextRequest) {
  try {
    const access = getAuthUserToken(req);
    const accessTtl = access.exp - Math.floor(Date.now() / 1000);
    await revokeToken(access.jti, accessTtl);

    const { refreshToken } = schema.parse(await req.json().catch(() => ({})));
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const refreshTtl = decoded.exp - Math.floor(Date.now() / 1000);
        await revokeToken(decoded.jti, refreshTtl);
      } catch {
        // Already invalid/expired — nothing to revoke.
      }
    }

    if (access.role === "doctor" && access.doctorId) {
      const ds = await getDataSource();
      const doctorRepo = ds.getRepository(Doctor);
      await doctorRepo.update(access.doctorId, {
        isOnlineForVideo: false,
        currentVideoLink: null,
      });
    }

    return ok({ message: "Logged out" });
  } catch (e) {
    return handleError(e);
  }
}
