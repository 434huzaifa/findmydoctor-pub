import { NextRequest } from "next/server";
import { getDataSource, Medicine } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";
import { getAuthUser } from "@/server/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ─── Params Type ───────────────────────────────────────────────────────────
type Params = { params: Promise<{ id: string }> };

// ─── Update Schema ─────────────────────────────────────────────────────────
const updateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  class: z.string().max(100).nullable().optional(),
  price: z.number().min(0).optional(),
  imageUrl: z.string().url().max(500).nullable().optional(),
});

// ─── GET Single Medicine ───────────────────────────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(req);
    const { id } = await params;
    const medicineId = parseInt(id);

    if (isNaN(medicineId)) {
      return notFound("Invalid medicine ID");
    }

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);

    const medicine = await medicineRepo.findOne({
      where: { id: medicineId },
    });

    if (!medicine) {
      return notFound("Medicine not found");
    }

    return ok(medicine);
  } catch (e) {
    return handleError(e);
  }
}

// ─── PATCH Update Medicine ─────────────────────────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(req);
    const { id } = await params;
    const medicineId = parseInt(id);

    if (isNaN(medicineId)) {
      return notFound("Invalid medicine ID");
    }

    const body = updateSchema.parse(await req.json());

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);

    const medicine = await medicineRepo.findOne({
      where: { id: medicineId },
    });

    if (!medicine) {
      return notFound("Medicine not found");
    }

    // ─── Update Fields ─────────────────────────────────────────────────────
    Object.assign(medicine, body);

    return ok(await medicineRepo.save(medicine));
  } catch (e) {
    return handleError(e);
  }
}

// ─── DELETE Medicine ───────────────────────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = getAuthUser(req);
    const { id } = await params;
    const medicineId = parseInt(id);

    if (isNaN(medicineId)) {
      return notFound("Invalid medicine ID");
    }

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);

    const medicine = await medicineRepo.findOne({
      where: { id: medicineId },
    });

    if (!medicine) {
      return notFound("Medicine not found");
    }

    await medicineRepo.remove(medicine);

    return ok({ message: "Medicine deleted successfully" });
  } catch (e) {
    return handleError(e);
  }
}