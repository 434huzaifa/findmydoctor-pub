import { NextRequest } from "next/server";
import { getDataSource, VirtualConsultation } from "@/server/db/data-source";
import { ok, notFound, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
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
    });

    if (!consultation) {
      return notFound("Consultation not found");
    }

    if (consultation.status === ConsultationStatus.DONE) {
      return badRequest("Consultation is already completed");
    }

    consultation.status = ConsultationStatus.DONE;
    await repo.save(consultation);

    return ok(consultation);
  } catch (e) {
    return handleError(e);
  }
}
