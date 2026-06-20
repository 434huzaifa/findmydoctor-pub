import { NextRequest } from "next/server";
import {
  getDataSource,
  VirtualConsultation,
  Doctor,
} from "@/server/db/data-source";
import { ok, notFound, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { createVideoRoomUrl } from "@/server/lib/daily";
import { ConsultationStatus } from "@/server/db/entities/VirtualConsultation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ds = await getDataSource();
    const repo = ds.getRepository(VirtualConsultation);

    const consultation = await repo.findOne({
      where: { id: parseInt(id) },
      relations: ["doctor"],
    });

    if (!consultation) {
      return notFound("Consultation not found");
    }

    if (consultation.status !== ConsultationStatus.WAITING) {
      return badRequest("Consultation is not in waiting status");
    }

    // Generate Jitsi room — pass doctor name for room context
    const doctorName = consultation.doctor?.name ?? "Doctor";
    const videoLink = createVideoRoomUrl(consultation.id, doctorName);

    consultation.status = ConsultationStatus.ACTIVE;
    consultation.videoLink = videoLink;

    await repo.save(consultation);

    return ok(consultation);
  } catch (e) {
    return handleError(e);
  }
}
