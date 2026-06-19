import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { handleError } from "@/server/lib/handle-error";
import { ALLOWED } from "@/server/db/admin-allowed";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { table, id } = await params;
    const tableName = ALLOWED[table];
    if (!tableName) throw new AppError("Unknown table", 400, "UNKNOWN_TABLE");
    const ds = await getDataSource();
    const repo = ds.getRepository(tableName);
    const existing = await repo.findOne({ where: { id } as never });
    if (!existing) throw new AppError("Row not found", 404, "ROW_NOT_FOUND");
    Object.assign(existing, await req.json());
    return ok(await repo.save(existing as object));
  } catch (e) {
    return handleError(e);
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { table, id } = await params;
    const tableName = ALLOWED[table];
    if (!tableName) throw new AppError("Unknown table", 400, "UNKNOWN_TABLE");
    const ds = await getDataSource();
    const repo = ds.getRepository(tableName);
    const existing = await repo.findOne({ where: { id } as never });
    if (!existing) throw new AppError("Row not found", 404, "ROW_NOT_FOUND");
    try {
      await repo.remove(existing as object);
    } catch (e: unknown) {
      const driverError = (
        e as {
          driverError?: { code?: string; detail?: string; constraint?: string };
        }
      )?.driverError;
      if (driverError?.code === "23503") {
        throw new AppError(
          "Cannot delete row because it is referenced by other records",
          409,
          "FK_CONSTRAINT",
          {
            table,
            id,
            detail: driverError.detail,
            constraint: driverError.constraint,
          },
        );
      }
      throw e;
    }
    return ok({ message: "Row deleted" });
  } catch (e) {
    return handleError(e);
  }
}
