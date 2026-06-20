"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "./Button";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 text-4xl">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="mt-6"
          variant="primary"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Preset Empty States ────────────────────────────────────────────────────

export function NoResultsState({
  onClear,
  entity = "items",
}: {
  onClear?: () => void;
  entity?: string;
}) {
  return (
    <EmptyState
      icon="🔍"
      title={`No ${entity} found`}
      description={`Try adjusting your search or filters to find what you're looking for.`}
      action={onClear ? { label: "Clear filters", onClick: onClear } : undefined}
    />
  );
}

export function ErrorState({
  onRetry,
  message = "Something went wrong",
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      icon="⚠️"
      title="Oops!"
      description={message}
      action={onRetry ? { label: "Try again", onClick: onRetry } : undefined}
    />
  );
}
