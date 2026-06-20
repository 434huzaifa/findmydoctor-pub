import { NextRequest } from "next/server";
import { getDataSource, Medicine, MedicineOrder } from "@/server/db/data-source";
import { ok, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { medicineId, quantity = 1, guestName, guestPhone, address } = body;

    if (!medicineId || !guestPhone || !address) {
      return badRequest("medicineId, guestPhone, and address are required");
    }

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);
    const orderRepo = ds.getRepository(MedicineOrder);

    // Check medicine exists
    const medicine = await medicineRepo.findOne({ where: { id: medicineId } });
    if (!medicine) {
      return badRequest("Medicine not found");
    }

    // Check stock
    if (medicine.stock < quantity) {
      return badRequest(`Insufficient stock. Available: ${medicine.stock}`);
    }

    // Create order
    const order = orderRepo.create({
      medicineId,
      quantity,
      guestName: guestName || null,
      guestPhone,
      address,
    });

    await orderRepo.save(order);

    // Decrease stock
    await medicineRepo.update(medicineId, {
      stock: () => `stock - ${quantity}`,
    });

    // Fetch with medicine relation
    const savedOrder = await orderRepo.findOne({
      where: { id: order.id },
      relations: ["medicine"],
    });

    return ok(savedOrder, 201);
  } catch (e) {
    return handleError(e);
  }
}
