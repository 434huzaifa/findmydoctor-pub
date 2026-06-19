"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  useGetDoctorCitiesQuery,
  useGetDoctorsQuery,
  useGetSpecialtiesQuery,
} from "@/store/fmdApi";
import { DoctorCard } from "@/features/doctors/DoctorCard";

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "fee_asc", label: "Fee ↑ (Low to High)" },
  { value: "fee_desc", label: "Fee ↓ (High to Low)" },
  { value: "booked_desc", label: "Most Booked" },
  { value: "booked_asc", label: "Least Booked" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Any Availability" },
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "full", label: "Full" },
];

const PAGE_SIZE = "9";

function DoctorsContent() {
  const searchParams = useSearchParams();
  const [specialtyFilter, setSpecialtyFilter] = useState(
    searchParams.get("specialty") ?? "",
  );
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") ?? "");
  const [availabilityFilter, setAvailabilityFilter] = useState(
    searchParams.get("availability") ?? "",
  );
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") ?? "");
  const [page, setPage] = useState(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isInteger(raw) && raw > 0 ? raw : 1;
  });
  const params: Record<string, string> = { page: String(page), limit: PAGE_SIZE };
  if (specialtyFilter) params.specialty = specialtyFilter;
  if (cityFilter) params.city = cityFilter;
  if (availabilityFilter) params.availability = availabilityFilter;
  if (search) params.search = search;
  if (sortBy) params.sortBy = sortBy;
  const { data: doctorList, isLoading } = useGetDoctorsQuery(params);
  const { data: specialties } = useGetSpecialtiesQuery();
  const { data: cities } = useGetDoctorCitiesQuery();

  const total = doctorList?.total ?? 0;
  const totalPages = doctorList?.totalPages ?? 0;
  const doctors = doctorList?.items ?? [];
  const activePage = doctorList?.page ?? page;
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  function resetAndSet(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="px-[5%] py-12">
      <h1 className="font-serif text-4xl font-black text-(--teal)">
        Find a Doctor
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          placeholder="Search by name or hospital..."
          value={search}
          onChange={(e) => resetAndSet(setSearch, e.target.value)}
          className="rounded-xl border border-(--border) px-4 py-2 text-sm focus:border-(--teal) focus:outline-none"
        />
        <select
          value={specialtyFilter}
          onChange={(e) => resetAndSet(setSpecialtyFilter, e.target.value)}
          className="rounded-xl border border-(--border) px-4 py-2 text-sm focus:border-(--teal) focus:outline-none"
        >
          <option value="">All Specialties</option>
          {specialties?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => resetAndSet(setCityFilter, e.target.value)}
          className="rounded-xl border border-(--border) px-4 py-2 text-sm focus:border-(--teal) focus:outline-none"
        >
          <option value="">All Cities</option>
          {cities?.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => resetAndSet(setAvailabilityFilter, e.target.value)}
          className="rounded-xl border border-(--border) px-4 py-2 text-sm focus:border-(--teal) focus:outline-none"
        >
          {AVAILABILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => resetAndSet(setSortBy, e.target.value)}
          className="rounded-xl border border-(--border) px-4 py-2 text-sm focus:border-(--teal) focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {(specialtyFilter || cityFilter || availabilityFilter || search || sortBy) && (
          <button
            onClick={() => {
              setSpecialtyFilter("");
              setCityFilter("");
              setAvailabilityFilter("");
              setSearch("");
              setSortBy("");
              setPage(1);
            }}
            className="rounded-xl border border-(--border) px-4 py-2 text-sm text-(--text-muted) hover:text-(--teal)"
          >
            Clear Filters
          </button>
        )}
      </div>
      <div className="mt-4 text-sm text-(--text-muted)">
        {total > 0
          ? `Showing ${doctors.length} of ${total} doctors`
          : "No doctors found yet."}
      </div>
      {isLoading ? (
        <p className="mt-10 text-(--text-muted)">
          Loading doctors...
        </p>
      ) : doctors.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-(--text-muted)">
          No doctors found matching your criteria.
        </p>
      )}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(activePage - 1, 1))}
            disabled={activePage <= 1}
            className="rounded-xl border border-(--border) px-4 py-2 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`rounded-xl px-4 py-2 text-sm ${
                pageNumber === activePage
                  ? "bg-(--teal) text-white"
                  : "border border-(--border) text-(--text)"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(Math.min(activePage + 1, totalPages))}
            disabled={activePage >= totalPages}
            className="rounded-xl border border-(--border) px-4 py-2 text-sm text-(--text) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense
      fallback={
        <div className="px-[5%] py-12 text-(--text-muted)">
          Loading...
        </div>
      }
    >
      <DoctorsContent />
    </Suspense>
  );
}
