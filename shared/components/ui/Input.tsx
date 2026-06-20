"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, hint, leftIcon, rightIcon, id, ...props },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)] focus:ring-offset-0 focus:border-[color:var(--teal)]",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-200",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}

        {hint && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Textarea ───────────────────────────────────────────────────────────────

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors resize-none",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)] focus:ring-offset-0 focus:border-[color:var(--teal)]",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200",
            className
          )}
          {...props}
        />

        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

// ─── Select ─────────────────────────────────────────────────────────────────

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border bg-white px-3 py-2.5 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[color:var(--teal)] focus:ring-offset-0 focus:border-[color:var(--teal)]",
            "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
