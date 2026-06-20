import { NextRequest } from "next/server";
import { getDataSource, VirtualConsultation } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { In } from "typeorm";
import { ConsultationStatus } from "@/server/db/entities/VirtualConsultation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params;

    const ds = await getDataSource();
    const repo = ds.getRepository(VirtualConsultation);

    // Get all waiting and active consultations for this doctor
    const consultations = await repo.find({
      where: {
        doctorId: parseInt(doctorId),
        status: In([ConsultationStatus.WAITING, ConsultationStatus.ACTIVE]),
      },
      order: {
        createdAt: "ASC",
      },
    });

    return ok(consultations);
  } catch (e) {
    return handleError(e);
  }
}
