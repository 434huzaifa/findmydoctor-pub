import { NextRequest } from "next/server";
import { getDataSource, VirtualConsultation } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
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

    return ok(consultation);
  } catch (e) {
    return handleError(e);
  }
}
