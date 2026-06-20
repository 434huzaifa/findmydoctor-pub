"use client";

import { DoctorCard, DoctorCardSkeleton } from "./DoctorCard";
import { NoResultsState } from "@/shared/components/ui/EmptyState";
import type { Doctor } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DoctorListProps {
  doctors: Doctor[];
  isLoading: boolean;
  onClearFilters?: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DoctorList({
  doctors,
  isLoading,
  onClearFilters,
}: DoctorListProps) {
  if (isLoading) {
    return <DoctorListSkeleton />;
  }

  if (doctors.length === 0) {
    return <NoResultsState entity="doctors" onClear={onClearFilters} />;
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

export function DoctorListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DoctorCardSkeleton key={i} />
      ))}
    </div>
  );
}
