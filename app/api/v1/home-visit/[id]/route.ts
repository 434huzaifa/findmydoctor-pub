import { NextRequest } from "next/server";
import { getDataSource, HomeVisitRequest } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ds = await getDataSource();
    const repo = ds.getRepository(HomeVisitRequest);

    const request = await repo.findOne({
      where: { id: parseInt(id) },
    });

    if (!request) {
      return notFound("Home visit request not found");
    }

    return ok(request);
  } catch (e) {
    return handleError(e);
  }
}
