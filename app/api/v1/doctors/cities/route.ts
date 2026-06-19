import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ds = await getDataSource();
    const rows = await ds
      .getRepository(Doctor)
      .createQueryBuilder("doctor")
      .select("DISTINCT doctor.city", "city")
      .where("doctor.city IS NOT NULL")
      .andWhere("TRIM(doctor.city) <> ''")
      .orderBy("doctor.city", "ASC")
      .getRawMany<{ city: string }>();

    return ok(rows.map((row) => row.city.trim()));
  } catch (e) {
    return handleError(e);
  }
}