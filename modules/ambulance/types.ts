import type { BaseEntity, PaginatedResponse } from "@/shared/types";

// ─── Ambulance ──────────────────────────────────────────────────────────────

export interface Ambulance extends BaseEntity {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  baseLocation: string;
  isAvailable: boolean;
  hourlyRate: number;
  publicDescription: string | null;
  detailedDescription: string | null;
}

// ─── Dispatch Status ────────────────────────────────────────────────────────

export type DispatchStatus = "dispatched" | "completed" | "cancelled";

// ─── Ambulance Dispatch ─────────────────────────────────────────────────────

export interface AmbulanceDispatch extends BaseEntity {
  ambulanceId: number;
  callerName: string;
  callerPhone: string;
  pickupLocation: string;
  startTime: string | null;
  endTime: string | null;
  totalCost: number | null;
  status: DispatchStatus;
  ambulance: Ambulance;
}

// ─── Booking Window Helpers ─────────────────────────────────────────────────

const MIN_BOOKING_HOURS = 1;
const MS_PER_HOUR = 60 * 60 * 1000;

export function minBookingEnd(start: Date): Date {
  return new Date(start.getTime() + MIN_BOOKING_HOURS * MS_PER_HOUR);
}

export function computeHours(start: Date, end: Date): number {
  return Math.ceil((end.getTime() - start.getTime()) / MS_PER_HOUR);
}

export function computeCost(hourlyRate: number, start: Date, end: Date): number {
  return hourlyRate * computeHours(start, end);
}

// ─── Filters ────────────────────────────────────────────────────────────────

export interface AmbulanceFilters {
  search: string;
  availableOnly: boolean;
}

export const DEFAULT_AMBULANCE_FILTERS: AmbulanceFilters = {
  search: "",
  availableOnly: false,
};

// ─── API Types ──────────────────────────────────────────────────────────────

export interface AmbulanceListParams {
  page?: string;
  limit?: string;
  search?: string;
  availableOnly?: string;
}

export type PaginatedAmbulances = PaginatedResponse<Ambulance>;

// ─── Dispatch Form ──────────────────────────────────────────────────────────

export interface DispatchForm {
  ambulanceId: number;
  callerName: string;
  callerPhone: string;
  pickupLocation: string;
  startTime: string;
  endTime: string;
}
