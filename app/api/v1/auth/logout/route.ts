
import { ok } from "@/server/lib/response";
export const runtime = "nodejs";
export async function POST() { return ok({ message: "Logged out" }); }
