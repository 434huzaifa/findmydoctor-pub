import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { AppError } from "@/server/lib/app-error";
import { ok } from "@/server/lib/response";
import { getDataSource } from "@/server/db/data-source";
import { Doctor } from "@/server/db/entities/Doctor";
import { Review } from "@/server/db/entities/Review";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function recomputeDoctorRating(doctorId: number) {
  const ds = await getDataSource();
  const { avg } = await ds
    .getRepository(Review)
    .createQueryBuilder("review")
    .select("AVG(review.rating)", "avg")
    .where("review.doctorId = :doctorId", { doctorId })
    .getRawOne<{ avg: string | null }>()
    .then((r) => r ?? { avg: null });

  await ds
    .getRepository(Doctor)
    .update(doctorId, { rating: avg ? Math.round(parseFloat(avg) * 10) / 10 : 0 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const { id: idRaw } = await params;
    const id = Number(idRaw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new AppError("Invalid review id", 400, "BAD_REQUEST");
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Review);
    const review = await repo.findOne({ where: { id } });
    if (!review) {
      throw new AppError("Review not found", 404, "NOT_FOUND");
    }

    await repo.remove(review);
    await recomputeDoctorRating(review.doctorId);

    return ok({ message: "Review deleted" });
  } catch (e) {
    return handleError(e);
  }
}
