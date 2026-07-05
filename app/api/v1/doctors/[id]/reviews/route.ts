import { NextRequest } from "next/server";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Review } from "@/server/db/entities/Review";
import { handleError } from "@/server/lib/handle-error";
import { maskPhone } from "@/shared/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idRaw } = await params;
    const doctorId = Number(idRaw);
    if (!Number.isInteger(doctorId) || doctorId <= 0) {
      throw new AppError("Invalid doctor id", 400, "BAD_REQUEST");
    }

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const skip = (page - 1) * limit;

    const ds = await getDataSource();
    const repo = ds.getRepository(Review);

    const [items, total] = await repo.findAndCount({
      where: { doctorId },
      order: { createdAt: "DESC" },
      take: limit,
      skip,
    });

    return ok({
      items: items.map((review) => ({
        ...review,
        patientPhone: maskPhone(review.patientPhone),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return handleError(e);
  }
}
