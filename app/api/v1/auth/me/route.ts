
import { NextRequest } from "next/server";
import { getAuthUser } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const { id, email, role, doctorId } = await getAuthUser(req);
    return ok({ id, email, role, doctorId });
  } catch (e) { return handleError(e); }
}
