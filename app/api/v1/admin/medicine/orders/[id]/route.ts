import { NextRequest } from "next/server";
import { getDataSource, MedicineOrder } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";
import { MedicineOrderStatus } from "@/server/db/entities/MedicineOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.nativeEnum(MedicineOrderStatus),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ds = await getDataSource();
    const repo = ds.getRepository(MedicineOrder);
    const order = await repo.findOne({ where: { id: Number(id) }, relations: { medicine: true } });
    if (!order) return notFound("Order not found");
    return ok(order);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository(MedicineOrder);
    const order = await repo.findOne({ where: { id: Number(id) }, relations: { medicine: true } });
    if (!order) return notFound("Order not found");
    order.status = body.status;
    const saved = await repo.save(order);
    return ok(saved);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ds = await getDataSource();
    const repo = ds.getRepository(MedicineOrder);
    const order = await repo.findOne({ where: { id: Number(id) } });
    if (!order) return notFound("Order not found");
    await repo.remove(order);
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
