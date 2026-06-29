
import { err } from "@/server/lib/response";
export async function POST() {
  return err("Self registration is disabled. Ask admin to create staff credentials.", "FORBIDDEN", 403);
}
export const runtime = "nodejs";
