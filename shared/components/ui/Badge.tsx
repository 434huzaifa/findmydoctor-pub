"use client";

import { cn } from "@/shared/lib/utils";
import { STATUS_COLORS } from "@/shared/constants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof STATUS_COLORS;
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  className?: string;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
  lg: "px-2.5 py-1 text-sm",
};

// ─── Component ──────────────────────────────────────────────────────────────

export function Badge({
  children,
  variant = "available",
  size = "md",
  dot = false,
  className,
}: BadgeProps) {
  const colors = STATUS_COLORS[variant] || STATUS_COLORS.available;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium rounded-full",
        colors.bg,
        colors.text,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "active" || variant === "available" 
              ? "bg-green-500 animate-pulse" 
              : "bg-current opacity-60"
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─── Status Badge ───────────────────────────────────────────────────────────

export interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as keyof typeof STATUS_COLORS;
  const variant = STATUS_COLORS[normalizedStatus] ? normalizedStatus : "available";

  return (
    <Badge variant={variant} size={size} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// ─── Availability Badge ─────────────────────────────────────────────────────

export interface AvailabilityBadgeProps {
  used: number;
  total: number;
  size?: "sm" | "md" | "lg";
}

export function AvailabilityBadge({ used, total, size = "md" }: AvailabilityBadgeProps) {
  const percentage = total > 0 ? (used / total) * 100 : 0;
  
  let variant: "available" | "limited" | "full" = "available";
  let label = "Available";

  if (percentage >= 100) {
    variant = "full";
    label = "Fully Booked";
  } else if (percentage >= 80) {
    variant = "limited";
    label = "Limited Slots";
  }

  return <Badge variant={variant} size={size}>{label}</Badge>;
}

// ─── Online Badge ───────────────────────────────────────────────────────────

export interface OnlineBadgeProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
}

export function OnlineBadge({ isOnline, size = "md" }: OnlineBadgeProps) {
  return (
    <Badge
      variant={isOnline ? "active" : "done"}
      size={size}
      dot
    >
      {isOnline ? "Online" : "Offline"}
    </Badge>
  );
}
