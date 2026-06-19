import { NextRequest } from "next/server";
import { getDataSource, Medicine } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // ─── Search Params ─────────────────────────────────────────────────────
    const search = searchParams.get("search") || "";
    const className = searchParams.get("class") || "";
    const company = searchParams.get("company") || "";

    // ─── Pagination Params ─────────────────────────────────────────────────
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10")),
    );
    const skip = (page - 1) * limit;

    // ─── Sort Params ───────────────────────────────────────────────────────
    const sortOrder = searchParams.get("sort") === "desc" ? "DESC" : "ASC";

    const ds = await getDataSource();
    const medicineRepo = ds.getRepository(Medicine);

    const query = medicineRepo.createQueryBuilder("medicine");

    // ─── Search Filter (name, class, company) ──────────────────────────────
    if (search) {
      query.andWhere(
        "(medicine.name ILIKE :search OR medicine.class ILIKE :search OR medicine.company ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    // ─── Individual Filters ────────────────────────────────────────────────
    if (className) {
      query.andWhere("medicine.class ILIKE :className", {
        className: `%${className}%`,
      });
    }

    if (company) {
      query.andWhere("medicine.company ILIKE :company", {
        company: `%${company}%`,
      });
    }

    // ─── Sort & Pagination ─────────────────────────────────────────────────
    query.orderBy("medicine.price", sortOrder).skip(skip).take(limit);

    // ─── Execute Query ─────────────────────────────────────────────────────
    const [data, total] = await query.getManyAndCount();

    return ok({
      items: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return handleError(e);
  }
}
