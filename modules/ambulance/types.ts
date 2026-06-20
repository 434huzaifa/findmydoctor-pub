import type { BaseEntity, PaginatedResponse } from "@/shared/types";

// ─── Ambulance ──────────────────────────────────────────────────────────────

export interface Ambulance extends BaseEntity {
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  baseLocation: string;
  isAvailable: boolean;
}

// ─── Dispatch Status ────────────────────────────────────────────────────────

export type DispatchStatus = "dispatched" | "completed" | "cancelled";

// ─── Ambulance Dispatch ─────────────────────────────────────────────────────

export interface AmbulanceDispatch extends BaseEntity {
  ambulanceId: number;
  callerName: string;
  callerPhone: string;
  pickupLocation: string;
  status: DispatchStatus;
  ambulance: Ambulance;
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
}
