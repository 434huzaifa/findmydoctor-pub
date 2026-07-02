"use client";

import React from "react";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 mt-1.5 ${className}`}>
      <span className="text-base">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

// Optional: Success message variant
export function FormSuccess({ message, className = "" }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-2 text-sm text-emerald-600 mt-1.5 ${className}`}>
      <span className="text-base">✅</span>
      <span>{message}</span>
    </div>
  );
}
