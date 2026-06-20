import { NextRequest } from "next/server";
import { getDataSource, VirtualConsultation } from "@/server/db/data-source";
import { ok, notFound, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { prescriptionText } = body;

    if (!prescriptionText) {
      return badRequest("prescriptionText is required");
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(VirtualConsultation);

    const consultation = await repo.findOne({
      where: { id: parseInt(id) },
    });

    if (!consultation) {
      return notFound("Consultation not found");
    }

    consultation.prescriptionText = prescriptionText;

    await repo.save(consultation);

    return ok(consultation);
  } catch (e) {
    return handleError(e);
  }
}
