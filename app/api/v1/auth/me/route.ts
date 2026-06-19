
import { NextRequest } from "next/server";
import { getAuthUser } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try { return ok(getAuthUser(req)); } catch (e) { return handleError(e); }
}
