import { NextRequest } from "next/server";
import { getDataSource, Order } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { OrderStatus } from "@/server/db/entities/Order";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_ORDER: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.PROCESSING]: "In Progress",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const ds = await getDataSource();
    const repo = ds.getRepository(Order);

    const orders = await repo.find({
      relations: { items: { medicine: true } },
      order: { createdAt: "DESC" },
    });

    const groups = STATUS_ORDER.map((status) => {
      const rows = orders.filter((order) => order.status === status);
      return {
        status,
        label: STATUS_LABELS[status],
        count: rows.length,
        rows,
      };
    });

    return ok({
      groups,
      total: orders.length,
      statuses: STATUS_ORDER,
    });
  } catch (e) {
    return handleError(e);
  }
}
