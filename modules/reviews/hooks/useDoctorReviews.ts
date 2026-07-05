"use client";

import { useGetDoctorReviewsQuery } from "@/store/fmdApi";
import { usePagination } from "@/shared/hooks/usePagination";

export function useDoctorReviews(doctorId: number) {
  const { page, pageSize, setPage, getPageNumbers } = usePagination({
    initialPageSize: 5,
  });

  const { data, isLoading, isFetching, isError, refetch } =
    useGetDoctorReviewsQuery({ doctorId, page, limit: pageSize });

  return {
    reviews: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,

    isLoading,
    isFetching,
    isError,

    page,
    pageSize,
    setPage,
    getPageNumbers,

    refetch,
  };
}
