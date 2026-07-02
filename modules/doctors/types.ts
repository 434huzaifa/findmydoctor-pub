import type { BaseEntity, PaginatedResponse, SortOrder } from "@/shared/types";

// ─── Specialty ──────────────────────────────────────────────────────────────

export interface Specialty extends BaseEntity {
  name: string;
  icon: string;
}

// ─── Doctor ─────────────────────────────────────────────────────────────────

export interface Doctor extends BaseEntity {
  name: string;
  specialty: Specialty;
  specialtyId: number;
  hospital: string;
  city: string;
  exp: number;
  fee: number;
  advanceFee: number;
  totalSeats: number;
  usedSeats: number;
  rating: number;
  degrees: string;
  chamberAddress: string | null;
  roomNumber: string | null;
  rrule: string | null;
  nextAppointment: string | null;
  chamberOpenTime: string | null;
  chamberCloseTime: string | null;
  isOnlineForVideo: boolean;
  currentVideoLink: string | null;
}

// ─── Doctor Availability ────────────────────────────────────────────────────

export type DoctorAvailability = "full" | "limited" | "available";

export function getDoctorAvailability(doctor: Doctor): DoctorAvailability {
  const percentage = doctor.totalSeats > 0 
    ? (doctor.usedSeats / doctor.totalSeats) * 100 
    : 0;
  
  if (percentage >= 100) return "full";
  if (percentage >= 80) return "limited";
  return "available";
}

export function getAvailableSlots(doctor: Doctor): number {
  return Math.max(0, doctor.totalSeats - doctor.usedSeats);
}

// ─── Doctor Filters ─────────────────────────────────────────────────────────

export type DoctorSortField = 
  | "fee_asc" 
  | "fee_desc" 
  | "rating_desc" 
  | "rating_asc" 
  | "exp_desc" 
  | "exp_asc" 
  | "";

export interface DoctorFilters {
  search: string;
  specialty: string;
  city: string;
  availability: DoctorAvailability | "";
  sortBy: DoctorSortField | "";
  sortOrder?: SortOrder;   // kept for compatibility but no longer used for sorting
}

export const DEFAULT_DOCTOR_FILTERS: DoctorFilters = {
  search: "",
  specialty: "",
  city: "",
  availability: "",
  sortBy: "",
  sortOrder: "desc",   // default to desc for rating-like sorting
};

// ─── API Types ──────────────────────────────────────────────────────────────

export interface DoctorListParams {
  page?: string;
  limit?: string;
  search?: string;
  specialty?: string;
  city?: string;
  availability?: DoctorAvailability | "";
  sortBy?: string;
}

export type PaginatedDoctors = PaginatedResponse<Doctor>;
