import { NextRequest } from "next/server";
import { getDataSource, Medicine, Order, OrderItem } from "@/server/db/data-source";
import { ok, badRequest } from "@/server/lib/response";
import { badRequest as badRequestError } from "@/server/lib/app-error";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guestName, guestPhone, address, items } = body;

    if (!guestPhone || !address) {
      return badRequest("guestPhone and address are required");
    }

    if (!Array.isArray(items) || items.length === 0) {
      return badRequest("items must be a non-empty array");
    }

    for (const item of items) {
      if (!item.medicineId || !item.quantity || item.quantity < 1) {
        return badRequest("Each item requires a valid medicineId and quantity");
      }
    }

    const ds = await getDataSource();

    const savedOrder = await ds.transaction(async (manager) => {
      const medicineRepo = manager.getRepository(Medicine);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const medicines = new Map<number, Medicine>();
      for (const item of items) {
        const medicine = await medicineRepo.findOne({
          where: { id: item.medicineId },
        });
        if (!medicine) {
          throw badRequestError(`Medicine ${item.medicineId} not found`);
        }
        if (medicine.stock < item.quantity) {
          throw badRequestError(
            `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`
          );
        }
        medicines.set(medicine.id, medicine);
      }

      const total = items.reduce((sum: number, item) => {
        const medicine = medicines.get(item.medicineId)!;
        return sum + Number(medicine.price) * item.quantity;
      }, 0);

      const order = orderRepo.create({
        guestName: guestName || null,
        guestPhone,
        address,
        total,
      });
      await orderRepo.save(order);

      for (const item of items) {
        const medicine = medicines.get(item.medicineId)!;
        const orderItem = orderItemRepo.create({
          orderId: order.id,
          medicineId: medicine.id,
          quantity: item.quantity,
          unitPrice: medicine.price,
        });
        await orderItemRepo.save(orderItem);

        await medicineRepo.update(medicine.id, {
          stock: () => `stock - ${item.quantity}`,
        });
      }

      return orderRepo.findOne({
        where: { id: order.id },
        relations: { items: { medicine: true } },
      });
    });

    return ok(savedOrder, 201);
  } catch (e) {
    return handleError(e);
  }
}
