"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const variants = {
  primary:
    "bg-[color:var(--teal)] text-white hover:bg-[color:var(--teal-light)] shadow-sm",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200",
  outline:
    "border border-[color:var(--border)] bg-white text-gray-700 hover:bg-gray-50",
  ghost:
    "text-gray-700 hover:bg-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  success:
    "bg-green-600 text-white hover:bg-green-700 shadow-sm",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
  xl: "px-6 py-3 text-base",
};

// ─── Component ──────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)] focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size} />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// ─── Spinner ────────────────────────────────────────────────────────────────

function Spinner({ size }: { size: string }) {
  const spinnerSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  return (
    <svg
      className={cn("animate-spin", spinnerSizes[size as keyof typeof spinnerSizes])}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
