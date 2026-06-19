import { NextRequest } from "next/server";
import { getDataSource, MedicineOrder, Medicine } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";
import { MedicineOrderStatus } from "@/server/db/entities/MedicineOrder";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Create Order Schema ───────────────────────────────────────────────────
const createSchema = z.object({
  medicineId: z.number().int().positive("Medicine ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  guestPhone: z
    .string()
    .min(1, "Phone number is required")
    .max(20, "Phone number too long"),
});

// ─── POST: Create Medicine Order ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = createSchema.parse(await req.json());

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);
    const orderRepo = ds.getRepository(MedicineOrder);

    // ─── Check if medicine exists ──────────────────────────────────────────
    const medicine = await medicineRepo.findOne({
      where: { id: body.medicineId },
    });

    if (!medicine) {
      return notFound("Medicine not found");
    }

    // ─── Create Order ──────────────────────────────────────────────────────
    const order = orderRepo.create({
      medicineId: body.medicineId,
      quantity: body.quantity,
      guestPhone: body.guestPhone,
      status: MedicineOrderStatus.PENDING,
    });

    const savedOrder = await orderRepo.save(order);

    // ─── Return with medicine details ──────────────────────────────────────
    const fullOrder = await orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ["medicine"],
    });

    return ok(fullOrder, 201);
  } catch (e) {
    return handleError(e);
  }
}

// ─── GET: All Orders with Pagination, Sort & Search ────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ─── Search Params ─────────────────────────────────────────────────────
    const phone = searchParams.get("phone") || "";

    // ─── Pagination Params ─────────────────────────────────────────────────
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    // ─── Sort Params ───────────────────────────────────────────────────────
    const sortOrder = searchParams.get("sort") === "desc" ? "DESC" : "ASC";

    const ds = await getDataSource();
    const orderRepo = ds.getRepository(MedicineOrder);

    const query = orderRepo
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.medicine", "medicine");

    // ─── Search by Phone ───────────────────────────────────────────────────
    if (phone) {
      query.andWhere("order.guestPhone ILIKE :phone", { phone: `%${phone}%` });
    }

    // ─── Sort by Medicine Price & Pagination ───────────────────────────────
    query
      .orderBy("medicine.price", sortOrder)
      .skip(skip)
      .take(limit);

    // ─── Execute ───────────────────────────────────────────────────────────
    const [data, total] = await query.getManyAndCount();

    return ok({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}