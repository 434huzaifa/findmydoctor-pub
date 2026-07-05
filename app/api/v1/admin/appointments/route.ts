import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Appointment } from "@/server/db/entities/Appointment";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    const ds = await getDataSource();
    const repo = ds.getRepository(Appointment);

    const [items, total] = await repo.findAndCount({
      where: status ? { status: status as Appointment["status"] } : {},
      relations: { doctor: true },
      order: { appointmentDate: "DESC", id: "DESC" },
      take: limit,
      skip,
    });

    return ok({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return handleError(e);
  }
}
