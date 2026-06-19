
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const ds = await getDataSource();
    const doctors = await ds.getRepository(Doctor).find({ relations: { specialty: true }, take: 6, order: { rating: "DESC", createdAt: "ASC" } });
    return ok(doctors);
  } catch (e) { return handleError(e); }
}
