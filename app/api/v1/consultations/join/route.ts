import { NextRequest } from "next/server";
import {
  getDataSource,
  Doctor,
  VirtualConsultation,
} from "@/server/db/data-source";
import { ok, badRequest, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import { ConsultationStatus } from "@/server/db/entities/VirtualConsultation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorId, patientName, patientPhone } = body;

    if (!doctorId || !patientName || !patientPhone) {
      return badRequest("doctorId, patientName, and patientPhone are required");
    }

    const ds = await getDataSource();
    const doctorRepo = ds.getRepository(Doctor);
    const consultationRepo = ds.getRepository(VirtualConsultation);

    // Check doctor exists and is online for video
    const doctor = await doctorRepo.findOne({
      where: { id: doctorId },
    });

    if (!doctor) {
      return notFound("Doctor not found");
    }

    if (!doctor.isOnlineForVideo) {
      return badRequest("Doctor is not available for video consultations");
    }

    // Create consultation in waiting status
    const consultation = consultationRepo.create({
      doctorId,
      patientName,
      patientPhone,
      status: ConsultationStatus.WAITING,
    });

    await consultationRepo.save(consultation);

    return ok(consultation, 201);
  } catch (e) {
    return handleError(e);
  }
}
