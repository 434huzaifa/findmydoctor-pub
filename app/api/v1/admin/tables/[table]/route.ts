import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { handleError } from "@/server/lib/handle-error";
import { ALLOWED } from "@/server/db/admin-allowed";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { table } = await params;
    const tableName = ALLOWED[table];
    if (!tableName) throw new AppError("Unknown table", 400, "UNKNOWN_TABLE");
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") ?? "1"));
    const limit = Math.min(200, Math.max(1, Number(sp.get("limit") ?? "50")));
    const ds = await getDataSource();
    const [rows, total] = await ds
      .getRepository(tableName)
      .findAndCount({ skip: (page - 1) * limit, take: limit });
    return ok({ rows, total, page, limit });
  } catch (e) {
    return handleError(e);
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ table: string }> },
) {
  try {
    const user = getAuthUser(req);
    requireRole(user, "admin");
    const { table } = await params;
    const tableName = ALLOWED[table];
    if (!tableName) throw new AppError("Unknown table", 400, "UNKNOWN_TABLE");
    const body = await req.json();
    const ds = await getDataSource();
    const repo = ds.getRepository(tableName);
    return ok(await repo.save(repo.create(body)), 201);
  } catch (e) {
    return handleError(e);
  }
}
