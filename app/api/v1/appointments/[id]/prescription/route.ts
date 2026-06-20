import { NextRequest } from "next/server";
import { getDataSource, Appointment } from "@/server/db/data-source";
import { ok, notFound, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/v1/appointments/:id/prescription
 * Save prescription for a regular appointment.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { prescriptionText } = body;

    if (!prescriptionText?.trim()) {
      return badRequest("prescriptionText is required");
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Appointment);

    const appointment = await repo.findOne({
      where: { id: parseInt(id) },
    });

    if (!appointment) {
      return notFound("Appointment not found");
    }

    appointment.prescriptionText = prescriptionText.trim();
    await repo.save(appointment);

    return ok(appointment);
  } catch (e) {
    return handleError(e);
  }
}
