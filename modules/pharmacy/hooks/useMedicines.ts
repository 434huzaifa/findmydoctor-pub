"use client";

import { useMemo } from "react";
import { useGetMedicinesQuery } from "@/store/fmdApi";
import { useFilters } from "@/shared/hooks/useFilters";
import { usePagination } from "@/shared/hooks/usePagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DEFAULT_MEDICINE_FILTERS, type MedicineFilters, type MedicineListParams } from "../types";

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMedicines() {
  // Filters
  const {
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
  } = useFilters<MedicineFilters>({
    initialFilters: DEFAULT_MEDICINE_FILTERS,
  });

  // Pagination
  const { page, pageSize, setPage, setPageSize, getPageNumbers } = usePagination();

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build query params
  const queryParams = useMemo<MedicineListParams>(() => {
    const params: MedicineListParams = {
      page: String(page),
      limit: String(pageSize),
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filters.class) params.class = filters.class;
    if (filters.company) params.company = filters.company;
    if (filters.sort) params.sort = filters.sort;

    return params;
  }, [debouncedSearch, filters, page, pageSize]);

  // API Query
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMedicinesQuery(queryParams);

  // Derived state
  const medicines = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Reset page when filters change
  const updateFilter = <K extends keyof MedicineFilters>(
    key: K,
    value: MedicineFilters[K]
  ) => {
    setFilter(key, value);
    setPage(1);
  };

  const handleResetFilters = () => {
    resetFilters();
    setPage(1);
  };

  return {
    // Data
    medicines,
    total,
    totalPages,

    // Loading states
    isLoading,
    isFetching,
    isError,

    // Filters
    filters,
    setFilter: updateFilter,
    resetFilters: handleResetFilters,
    hasActiveFilters,

    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize,
    getPageNumbers,

    // Actions
    refetch,
  };
}
