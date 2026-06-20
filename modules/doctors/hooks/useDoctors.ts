"use client";

import { useMemo } from "react";
import {
  useGetDoctorsQuery,
  useGetSpecialtiesQuery,
  useGetDoctorCitiesQuery,
} from "@/store/fmdApi";
import { useFilters } from "@/shared/hooks/useFilters";
import { usePagination } from "@/shared/hooks/usePagination";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type {
  DoctorListParams as ApiDoctorListParams,
  DoctorSort,
} from "@/types/domain";
import { DEFAULT_DOCTOR_FILTERS, type DoctorFilters } from "../types";

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useDoctors() {
  // Filters
  const { filters, setFilter, resetFilters, hasActiveFilters } =
    useFilters<DoctorFilters>({
      initialFilters: DEFAULT_DOCTOR_FILTERS,
    });

  // Pagination
  const { page, pageSize, setPage, setPageSize, getPageNumbers } =
    usePagination();

  // Debounce search
  const debouncedSearch = useDebounce(filters.search, 300);

  // Build query params
  const queryParams = useMemo<ApiDoctorListParams>(() => {
    const params: ApiDoctorListParams = {
      page: String(page),
      limit: String(pageSize),
    };

    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (filters.specialty) params.specialty = filters.specialty;
    if (filters.city) params.city = filters.city;
    if (filters.availability) params.availability = filters.availability;
    if (filters.sortBy) {
      params.sortBy = `${filters.sortBy}_${filters.sortOrder}` as DoctorSort;
    }

    return params;
  }, [debouncedSearch, filters, page, pageSize]);

  // API Queries
  const { data, isLoading, isFetching, isError, refetch } =
    useGetDoctorsQuery(queryParams);

  const { data: specialties } = useGetSpecialtiesQuery();
  const { data: cities } = useGetDoctorCitiesQuery();

  // Derived state
  const doctors = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  // Reset page when filters change
  const updateFilter = <K extends keyof DoctorFilters>(
    key: K,
    value: DoctorFilters[K],
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
    doctors,
    total,
    totalPages,
    specialties: specialties ?? [],
    cities: cities ?? [],

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
