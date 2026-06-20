"use client";

import { cn } from "@/shared/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getPageNumbers: (totalPages: number) => (number | "...")[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function Pagination({
  page,
  totalPages,
  onPageChange,
  getPageNumbers,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(totalPages);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Previous */}
      <PaginationButton
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </PaginationButton>

      {/* Page numbers */}
      {pages.map((pageNum, idx) =>
        pageNum === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <PaginationButton
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            isActive={pageNum === page}
          >
            {pageNum}
          </PaginationButton>
        )
      )}

      {/* Next */}
      <PaginationButton
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </PaginationButton>
    </div>
  );
}

// ─── Pagination Button ──────────────────────────────────────────────────────

interface PaginationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
}

function PaginationButton({
  onClick,
  disabled,
  isActive,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-10 min-w-10 px-3 rounded-lg text-sm font-medium transition-colors",
        "flex items-center justify-center",
        isActive
          ? "bg-[color:var(--teal)] text-white"
          : "bg-white border border-gray-200 text-gray-600 hover:border-[color:var(--teal-light)] hover:text-[color:var(--teal)]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
