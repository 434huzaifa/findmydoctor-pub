
import { getDataSource, Specialty } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export async function GET() {
  try {
    const ds = await getDataSource();
    const items = await ds.getRepository(Specialty).find({ order: { name: "ASC" } });
    return ok(items);
  } catch (e) { return handleError(e); }
}
