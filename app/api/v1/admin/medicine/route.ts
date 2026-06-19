import { NextRequest } from "next/server";
import { getDataSource, Medicine } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().nullable().optional(),
  company: z.string().max(255).nullable().optional(),
  class: z.string().max(100).nullable().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  imageUrl: z.url("Must be a valid URL").max(500).nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const body = schema.parse(await req.json());
    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);

    const medicine = medicineRepo.create({
      name: body.name,
      description: body.description ?? null,
      company: body.company ?? null,
      class: body.class ?? null,
      price: body.price,
      imageUrl: body.imageUrl ?? null,
    });

    return ok(await medicineRepo.save(medicine), 201);
  } catch (e) {
    return handleError(e);
  }
}
