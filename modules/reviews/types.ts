import type { BaseEntity, PaginatedResponse } from "@/shared/types";

// ─── Review ─────────────────────────────────────────────────────────────────

export interface Review extends BaseEntity {
  appointmentId: number;
  doctorId: number;
  patientName: string;
  patientPhone: string;
  rating: number;
  comment: string | null;
}

export type PaginatedReviews = PaginatedResponse<Review>;

// ─── API Types ──────────────────────────────────────────────────────────────

export interface DoctorReviewsParams {
  page?: string;
  limit?: string;
}

export interface SubmitReviewParams {
  appointmentId: number;
  phone: string;
  otpToken: string;
  rating: number;
  comment?: string;
}
