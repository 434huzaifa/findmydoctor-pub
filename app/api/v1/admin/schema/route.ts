import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { handleError } from "@/server/lib/handle-error";
import { ALLOWED } from "@/server/db/admin-allowed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const ds = await getDataSource();

    const tables = Object.entries(ALLOWED).map(([key, entity]) => {
      const meta = ds.getMetadata(entity);
      return {
        key,
        tableName: meta.tableName,
        columns: meta.columns.map((c) => ({
          name: c.propertyName,
          databaseName: c.databaseName,
          type: String(c.type),
          nullable: c.isNullable,
          isPrimary: c.isPrimary,
          isGenerated: c.isGenerated,
          default: c.default,
        })),
      };
    });

    return ok(tables);
  } catch (e) {
    return handleError(e);
  }
}
