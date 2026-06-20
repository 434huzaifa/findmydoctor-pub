"use client";

import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  className?: string;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
  xl: "h-10 w-10 border-4",
};

const colorStyles = {
  primary: "border-[color:var(--teal-pale)] border-t-[color:var(--teal)]",
  white: "border-white/30 border-t-white",
  gray: "border-gray-200 border-t-gray-600",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function Spinner({
  size = "md",
  color = "primary",
  className,
}: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeStyles[size],
        colorStyles[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// ─── Full Page Spinner ──────────────────────────────────────────────────────

export interface PageSpinnerProps {
  message?: string;
}

export function PageSpinner({ message = "Loading..." }: PageSpinnerProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

// ─── Inline Spinner ─────────────────────────────────────────────────────────

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <Spinner size="md" />
    </div>
  );
}
