// ─── Base Types ─────────────────────────────────────────────────────────────

export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API Types ──────────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Form Types ─────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldError {
  field: string;
  message: string;
}

// ─── Component Props Types ──────────────────────────────────────────────────

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Utility Types ──────────────────────────────────────────────────────────

export type SortOrder = "asc" | "desc";

export type LoadingState = "idle" | "loading" | "success" | "error";

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
