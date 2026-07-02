import { NextRequest } from "next/server";
import { getDataSource, Order } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ds = await getDataSource();
    const repo = ds.getRepository(Order);

    const order = await repo.findOne({
      where: { id: Number(id) },
      relations: { items: { medicine: true } },
    });

    if (!order) return notFound("Order not found");

    return ok(order);
  } catch (e) {
    return handleError(e);
  }
}
