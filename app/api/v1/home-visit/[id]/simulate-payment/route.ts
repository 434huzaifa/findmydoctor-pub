import { NextRequest } from "next/server";
import { getDataSource, HomeVisitRequest } from "@/server/db/data-source";
import { ok, notFound, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

    if (request.isPaid) {
      return badRequest("Payment already completed");
    }

    // Simulate successful payment
    request.isPaid = true;
    request.paidAt = new Date();

    await repo.save(request);

    return ok(request);
  } catch (e) {
    return handleError(e);
  }
}
