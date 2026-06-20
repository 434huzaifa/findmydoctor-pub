import { NextRequest } from "next/server";
import { getDataSource, Ambulance } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const availableOnly = searchParams.get("availableOnly") === "true";

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    const ds = await getDataSource();
    const ambulanceRepo = ds.getRepository(Ambulance);

    const query = ambulanceRepo.createQueryBuilder("ambulance");

    // Search by location, vehicle number, driver name
    if (search) {
      query.andWhere(
        "(ambulance.baseLocation ILIKE :search OR ambulance.vehicleNumber ILIKE :search OR ambulance.driverName ILIKE :search)",
        { search: `%${search}%` }
      );
    }

    // Filter available only
    if (availableOnly) {
      query.andWhere("ambulance.isAvailable = :isAvailable", {
        isAvailable: true,
      });
    }

    query.orderBy("ambulance.isAvailable", "DESC").skip(skip).take(limit);

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
