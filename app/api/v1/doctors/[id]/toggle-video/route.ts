import { NextRequest } from "next/server";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/v1/doctors/:id/toggle-video
 * Toggle doctor online status for video consultations.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isOnlineForVideo } = body;

    const ds = await getDataSource();
    const doctorRepo = ds.getRepository(Doctor);

    const doctor = await doctorRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["specialty"],
    });

    if (!doctor) {
      return notFound("Doctor not found");
    }

    doctor.isOnlineForVideo =
      typeof isOnlineForVideo === "boolean"
        ? isOnlineForVideo
        : !doctor.isOnlineForVideo;

    if (!doctor.isOnlineForVideo) {
      doctor.currentVideoLink = null;
    }

    await doctorRepo.save(doctor);

    return ok(doctor);
  } catch (e) {
    return handleError(e);
  }
}
