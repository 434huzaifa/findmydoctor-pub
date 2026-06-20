import type { BaseEntity, PaginatedResponse, SortOrder } from "@/shared/types";

// ─── Medicine ───────────────────────────────────────────────────────────────

export interface Medicine extends BaseEntity {
  name: string;
  description: string | null;
  company: string | null;
  class: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export function isInStock(medicine: Medicine): boolean {
  return medicine.stock > 0;
}

export function getStockStatus(medicine: Medicine): "in-stock" | "low-stock" | "out-of-stock" {
  if (medicine.stock === 0) return "out-of-stock";
  if (medicine.stock <= 10) return "low-stock";
  return "in-stock";
}

// ─── Medicine Order ─────────────────────────────────────────────────────────

export type MedicineOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "delivered"
  | "cancelled";

export interface MedicineOrder extends BaseEntity {
  medicineId: number;
  quantity: number;
  guestName: string | null;
  guestPhone: string;
  address: string;
  status: MedicineOrderStatus;
  medicine: Medicine;
}

// ─── Medicine Filters ───────────────────────────────────────────────────────

export interface MedicineFilters {
  search: string;
  class: string;
  company: string;
  sort: SortOrder;
}

export const DEFAULT_MEDICINE_FILTERS: MedicineFilters = {
  search: "",
  class: "",
  company: "",
  sort: "asc",
};

// ─── API Types ──────────────────────────────────────────────────────────────

export interface MedicineListParams {
  page?: string;
  limit?: string;
  search?: string;
  class?: string;
  company?: string;
  sort?: SortOrder;
}

export type PaginatedMedicines = PaginatedResponse<Medicine>;

// ─── Order Form ─────────────────────────────────────────────────────────────

export interface MedicineOrderForm {
  medicineId: number;
  quantity: number;
  guestName: string;
  guestPhone: string;
  address: string;
  paymentMethod: "online" | "cash";
}
