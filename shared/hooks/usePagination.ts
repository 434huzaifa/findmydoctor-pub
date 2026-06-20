"use client";

import { useState, useMemo, useCallback } from "react";
import { APP_CONFIG } from "@/shared/constants";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  offset: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  getPageNumbers: (totalPages: number) => (number | "...")[];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = APP_CONFIG.defaultPageSize,
  } = options;

  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const offset = useMemo(() => (page - 1) * pageSize, [page, pageSize]);

  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to first page when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPageState((prev) => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPageState((prev) => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
  }, [initialPage, initialPageSize]);

  const getPageNumbers = useCallback(
    (totalPages: number): (number | "...")[] => {
      if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const pages: (number | "...")[] = [1];

      if (page > 3) pages.push("...");

      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("...");

      pages.push(totalPages);

      return pages;
    },
    [page]
  );

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    reset,
    getPageNumbers,
  };
}
