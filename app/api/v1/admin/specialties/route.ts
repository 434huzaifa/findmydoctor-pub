import { NextRequest } from "next/server";
import { z } from "zod";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import type { Specialty } from "@/types/domain";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const specialtySchema = z.object({
  name: z.string().min(1),
  icon: z.string().default(""),
});

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const ds = await getDataSource();
    const items = await ds
      .getRepository<Specialty>("specialties")
      .find({ order: { name: "ASC" } });
    return ok(items);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const body = specialtySchema.parse(await req.json());
    const ds = await getDataSource();
    const repo = ds.getRepository<Specialty>("specialties");
    const existing = await repo.findOne({ where: { name: body.name } });
    if (existing)
      throw new AppError("Specialty already exists", 409, "CONFLICT");
    const saved = await repo.save(repo.create(body));
    return ok(saved, 201);
  } catch (e) {
    return handleError(e);
  }
}
