import { NextRequest } from "next/server";
import { getDataSource, Medicine, Order } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";
import { OrderStatus } from "@/server/db/entities/Order";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

async function restoreStock(orderId: number) {
  const ds = await getDataSource();
  await ds.transaction(async (manager) => {
    const orderRepo = manager.getRepository(Order);
    const medicineRepo = manager.getRepository(Medicine);

    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) return;

    for (const item of order.items) {
      await medicineRepo.update(item.medicineId, {
        stock: () => `stock + ${item.quantity}`,
      });
    }
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const { id } = await params;
    const body = updateSchema.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository(Order);
    const order = await repo.findOne({
      where: { id: Number(id) },
      relations: { items: { medicine: true } },
    });
    if (!order) return notFound("Order not found");

    const wasCancelled = order.status === OrderStatus.CANCELLED;
    const willBeCancelled = body.status === OrderStatus.CANCELLED;

    order.status = body.status;
    const saved = await repo.save(order);

    if (!wasCancelled && willBeCancelled) {
      await restoreStock(order.id);
    }

    return ok(saved);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const { id } = await params;
    const ds = await getDataSource();
    const repo = ds.getRepository(Order);
    const order = await repo.findOne({ where: { id: Number(id) } });
    if (!order) return notFound("Order not found");

    if (order.status !== OrderStatus.CANCELLED) {
      await restoreStock(order.id);
    }

    await repo.remove(order);
    return ok({ success: true });
  } catch (e) {
    return handleError(e);
  }
}
