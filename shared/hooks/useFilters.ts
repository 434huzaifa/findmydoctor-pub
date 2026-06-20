"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type FilterValue = string | number | boolean | undefined;

type FilterRecord<T> = {
  [K in keyof T]: FilterValue;
};

export interface UseFiltersOptions<T extends object> {
  initialFilters: T & FilterRecord<T>;
  onFilterChange?: (filters: T & FilterRecord<T>) => void;
}

export interface UseFiltersReturn<T extends object> {
  filters: T & FilterRecord<T>;
  setFilter: <K extends keyof T>(
    key: K,
    value: (T & FilterRecord<T>)[K],
  ) => void;
  setFilters: (filters: Partial<T & FilterRecord<T>>) => void;
  resetFilters: () => void;
  clearFilter: (key: keyof T) => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  getQueryParams: () => Record<string, string>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useFilters<T extends object>(
  options: UseFiltersOptions<T>,
): UseFiltersReturn<T> {
  const { initialFilters, onFilterChange } = options;
  const [filters, setFiltersState] = useState<T & FilterRecord<T>>(
    initialFilters,
  );

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: (T & FilterRecord<T>)[K]) => {
      setFiltersState((prev) => {
        const next = { ...prev, [key]: value } as T & FilterRecord<T>;
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange],
  );

  const setFilters = useCallback(
    (newFilters: Partial<T & FilterRecord<T>>) => {
      setFiltersState((prev) => {
        const next = { ...prev, ...newFilters } as T & FilterRecord<T>;
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange],
  );

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    onFilterChange?.(initialFilters);
  }, [initialFilters, onFilterChange]);

  const clearFilter = useCallback(
    (key: keyof T) => {
      setFiltersState((prev) => {
        const next = { ...prev, [key]: initialFilters[key] } as T &
          FilterRecord<T>;
        onFilterChange?.(next);
        return next;
      });
    },
    [initialFilters, onFilterChange],
  );

  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some((key) => {
      const value = filters[key as keyof T];
      const initial = initialFilters[key as keyof T];
      return value !== initial && value !== "" && value !== undefined;
    });
  }, [filters, initialFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key as keyof T];
      const initial = initialFilters[key as keyof T];
      return value !== initial && value !== "" && value !== undefined;
    }).length;
  }, [filters, initialFilters]);

  const getQueryParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    (Object.entries(filters) as Array<[string, FilterValue]>).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== "" &&
          value !== initialFilters[key as keyof T]
        ) {
          params[key] = String(value);
        }
      },
    );
    return params;
  }, [filters, initialFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
    getQueryParams,
  };
}
