import { getDataSource, MedicineOrder } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { MedicineOrderStatus } from "@/server/db/entities/MedicineOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_ORDER: MedicineOrderStatus[] = [
  MedicineOrderStatus.PENDING,
  MedicineOrderStatus.CONFIRMED,
  MedicineOrderStatus.PROCESSING,
  MedicineOrderStatus.DELIVERED,
  MedicineOrderStatus.CANCELLED,
];

const STATUS_LABELS: Record<MedicineOrderStatus, string> = {
  [MedicineOrderStatus.PENDING]: "Pending",
  [MedicineOrderStatus.CONFIRMED]: "Confirmed",
  [MedicineOrderStatus.PROCESSING]: "In Progress",
  [MedicineOrderStatus.DELIVERED]: "Delivered",
  [MedicineOrderStatus.CANCELLED]: "Cancelled",
};

export async function GET() {
  try {
    const ds = await getDataSource();
    const repo = ds.getRepository(MedicineOrder);

    const orders = await repo.find({
      relations: { medicine: true },
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
