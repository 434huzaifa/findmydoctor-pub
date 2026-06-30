import { APP_CONFIG } from "@/shared/constants";

// ─── Class Names (no external dependency) ───────────────────────────────────

type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | null
  | ClassValue[];

function toVal(mix: ClassValue): string {
  let str = "";
  if (
    typeof mix === "string" ||
    typeof mix === "number" ||
    typeof mix === "bigint"
  ) {
    str += String(mix);
  } else if (typeof mix === "object" && mix !== null) {
    if (Array.isArray(mix)) {
      for (const item of mix) {
        const y = toVal(item);
        if (y) str += (str ? " " : "") + y;
      }
    }
  }
  return str;
}

function clsx(...args: ClassValue[]): string {
  let str = "";
  for (const arg of args) {
    const x = toVal(arg);
    if (x) str += (str ? " " : "") + x;
  }
  return str;
}

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  // Simple merge — just concatenates unique classes.
  // If you install `clsx` + `tailwind-merge` later, swap this out.
  return clsx(...inputs);
}

// ─── Currency Formatting ────────────────────────────────────────────────────

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${APP_CONFIG.currency}${(isNaN(num) ? 0 : num).toLocaleString()}`;
}

export function formatPrice(price: number | string, decimals = 2): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `${APP_CONFIG.currency}${(isNaN(num) ? 0 : num).toFixed(decimals)}`;
}

// ─── Date Formatting ────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getToday(): string {
  return formatDateForInput(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ─── String Utilities ───────────────────────────────────────────────────────

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// ─── Number Utilities ───────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function normalizePhoneInput(phone: string): string {
  return phone.replace(/\D/g, "").slice(0, 11);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhoneInput(phone);
  return cleaned.length === 11;
}

// ─── Delay ──────────────────────────────────────────────────────────────────

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Query String ───────────────────────────────────────────────────────────

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const filtered = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== "",
  );
  if (filtered.length === 0) return "";
  return `?${new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)]),
  ).toString()}`;
}
