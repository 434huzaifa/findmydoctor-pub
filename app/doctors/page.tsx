"use client";

import { 
  useDoctors,
  DoctorList,
  DoctorFiltersPanel,
  Pagination,
} from "@/modules/doctors";
import { PageHeader } from "@/shared/components/layout/PageHeader";

// ─── Page ───────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const {
    doctors,
    total,
    totalPages,
    specialties,
    cities,
    isLoading,
    isFetching,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    page,
    setPage,
    getPageNumbers,
  } = useDoctors();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <PageHeader
        icon="🩺"
        title="Find Doctors"
        subtitle="Browse our network of qualified healthcare professionals"
        gradient="from-blue-600 to-indigo-700"
      >
        <DoctorFiltersPanel
          filters={filters}
          specialties={specialties}
          cities={cities}
          onFilterChange={setFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          total={total}
        />
      </PageHeader>

      {/* Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DoctorList
            doctors={doctors}
            isLoading={isLoading || isFetching}
            onClearFilters={resetFilters}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                getPageNumbers={getPageNumbers}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
