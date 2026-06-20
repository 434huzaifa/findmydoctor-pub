import { NextRequest } from "next/server";
import { MedicineService } from "@/server/modules/medicine";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/medicine
 * 
 * Get paginated list of medicines with filters
 * 
 * Query params:
 * - search: Search by name, description, class, or company
 * - class: Filter by medicine class
 * - company: Filter by company
 * - sort: "asc" or "desc" for price sorting
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const result = await MedicineService.getList({
      search: searchParams.get("search") || undefined,
      class: searchParams.get("class") || undefined,
      company: searchParams.get("company") || undefined,
      sort: (searchParams.get("sort") as "asc" | "desc") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });

    return ok(result);
  } catch (e) {
    return handleError(e);
  }
}
