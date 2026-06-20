import type { BaseEntity } from "@/shared/types";

// ─── Home Visit Request ─────────────────────────────────────────────────────

export interface HomeVisitRequest extends BaseEntity {
  patientName: string;
  phone: string;
  address: string;
  situationDescription: string | null;
  isPaid: boolean;
  amount: number;
  paidAt: string | null;
}

// ─── Request Form ───────────────────────────────────────────────────────────

export interface HomeVisitForm {
  patientName: string;
  phone: string;
  address: string;
  situationDescription: string;
}

// ─── Payment Status ─────────────────────────────────────────────────────────

export function getPaymentStatus(request: HomeVisitRequest): "pending" | "paid" {
  return request.isPaid ? "paid" : "pending";
}
