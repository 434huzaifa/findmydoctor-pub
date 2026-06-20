import type { BaseEntity } from "@/shared/types";
import type { Doctor } from "@/modules/doctors/types";

// ─── Consultation Status ────────────────────────────────────────────────────

export type ConsultationStatus = "waiting" | "active" | "done";

// ─── Virtual Consultation ───────────────────────────────────────────────────

export interface VirtualConsultation extends BaseEntity {
  doctorId: number;
  patientName: string;
  patientPhone: string;
  status: ConsultationStatus;
  prescriptionText: string | null;
  videoLink: string | null;
  doctor?: Doctor;
}

// ─── Consultation Queue ─────────────────────────────────────────────────────

export interface ConsultationQueue {
  waiting: VirtualConsultation[];
  active: VirtualConsultation | null;
}

export function getConsultationQueue(
  consultations: VirtualConsultation[]
): ConsultationQueue {
  return {
    waiting: consultations.filter((c) => c.status === "waiting"),
    active: consultations.find((c) => c.status === "active") || null,
  };
}

// ─── Join Queue Form ────────────────────────────────────────────────────────

export interface JoinQueueForm {
  doctorId: number;
  patientName: string;
  patientPhone: string;
}

// ─── Prescription Form ──────────────────────────────────────────────────────

export interface PrescriptionForm {
  consultationId: number;
  prescriptionText: string;
}
