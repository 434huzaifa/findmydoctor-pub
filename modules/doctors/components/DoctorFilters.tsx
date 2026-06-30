"use client";

import { Input, Select } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";
import type { DoctorFilters as DoctorFiltersType, Specialty } from "../types";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DoctorFiltersProps {
  filters: DoctorFiltersType;
  specialties: Specialty[];
  cities: string[];
  onFilterChange: <K extends keyof DoctorFiltersType>(
    key: K,
    value: DoctorFiltersType[K]
  ) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  total: number;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DoctorFiltersPanel({
  filters,
  specialties,
  cities,
  onFilterChange,
  onReset,
  hasActiveFilters,
  total,
}: DoctorFiltersProps) {
  const specialtyOptions = [
    { value: "", label: "All Specialties" },
    ...specialties.map((s) => ({
      value: s.id.toString(),
      label: `${s.icon} ${s.name}`,
    })),
  ];

  const cityOptions = [
    { value: "", label: "All Cities" },
    ...cities.map((c) => ({ value: c, label: c })),
  ];

  const sortOptions = [
    { value: "", label: "Sort by" },
    { value: "fee", label: "Fee: Low → High" },
    { value: "rating", label: "Rating: High → Low" },
    { value: "exp", label: "Experience" },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search doctors..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            leftIcon={<SearchIcon />}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            options={specialtyOptions}
            value={filters.specialty}
            onChange={(e) => onFilterChange("specialty", e.target.value)}
          />
        </div>

        <div className="w-full sm:w-40">
          <Select
            options={cityOptions}
            value={filters.city}
            onChange={(e) => onFilterChange("city", e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            options={sortOptions}
            value={filters.sortBy}
            onChange={(e) => onFilterChange("sortBy", e.target.value as DoctorFiltersType["sortBy"])}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Found <span className="font-medium text-gray-700">{total}</span> doctors
      </div>
    </div>
  );
}

// ─── Icons ──────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
