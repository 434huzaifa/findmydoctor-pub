import { NextRequest } from "next/server";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/doctors/online
 * Returns list of doctors currently online for video consultation.
 * Frontend polls this every 5 seconds.
 */
export async function GET(_req: NextRequest) {
  try {
    const ds = await getDataSource();
    const doctors = await ds.getRepository(Doctor).find({
      where: { isOnlineForVideo: true },
      relations: ["specialty"],
      order: { name: "ASC" },
    });

    return ok(doctors);
  } catch (e) {
    return handleError(e);
  }
}
