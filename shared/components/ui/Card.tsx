"use client";

import { cn } from "@/shared/lib/utils";
import type { BaseComponentProps } from "@/shared/types";

// ─── Card ───────────────────────────────────────────────────────────────────

export interface CardProps extends BaseComponentProps {
  variant?: "default" | "outline" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  default: "bg-white border border-gray-200",
  outline: "bg-transparent border border-gray-200",
  elevated: "bg-white shadow-lg border-0",
};

const paddingStyles = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  className,
  children,
  variant = "default",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        variantStyles[variant],
        paddingStyles[padding],
        hover && "transition-shadow hover:shadow-lg",
        isClickable && "cursor-pointer hover:border-[color:var(--teal-light)]",
        className
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// ─── Card Header ────────────────────────────────────────────────────────────

export interface CardHeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ─── Card Body ──────────────────────────────────────────────────────────────

export function CardBody({ className, children }: BaseComponentProps) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}

// ─── Card Footer ────────────────────────────────────────────────────────────

export function CardFooter({ className, children }: BaseComponentProps) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  className?: string;
}

const colorStyles = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  red: "bg-red-50 border-red-200 text-red-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  gray: "bg-gray-50 border-gray-200 text-gray-700",
};

export function StatCard({
  label,
  value,
  icon,
  trend,
  color = "gray",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        colorStyles[color],
        className
      )}
    >
      <div className="flex items-center justify-between">
        {icon && <div className="text-2xl">{icon}</div>}
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
      <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
    </div>
  );
}
