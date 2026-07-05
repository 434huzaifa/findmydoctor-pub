
"use client";
import { use } from "react";
import Link from "next/link";
import { useGetDoctorQuery } from "@/store/fmdApi";
import { COLORS, getAvailStatus, getColorIndex, getInitials } from "@/lib/doctor";
import { useDoctorReviews } from "@/modules/reviews";

export default function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const doctorId = parseInt(id, 10);
  const { data: doctor, isLoading, isError } = useGetDoctorQuery(doctorId);
  const {
    reviews,
    total: totalReviews,
    page,
    totalPages,
    setPage,
    isLoading: reviewsLoading,
  } = useDoctorReviews(doctorId);
  if (isLoading) return <div className="py-24 text-center text-[color:var(--text-muted)]">Loading...</div>;
  if (isError || !doctor) return <div className="py-24 text-center text-red-500">Doctor not found.</div>;
  const color = COLORS[getColorIndex(doctor.id)];
  const avail = getAvailStatus(doctor);
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <div className="flex items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full font-serif text-2xl font-bold text-white" style={{ backgroundColor: color }}>
          {getInitials(doctor.name)}
        </div>
        <div>
          <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">{doctor.name}</h1>
          <p className="text-sm font-medium text-[color:var(--teal-light)]">{doctor.specialty?.icon} {doctor.specialty?.name}</p>
          <p className="text-sm text-[color:var(--text-muted)]">🏥 {doctor.hospital} · 📍 {doctor.city} · {doctor.exp} yrs exp</p>
          {doctor.degrees && <p className="mt-1 text-xs text-[color:var(--text-muted)]">{doctor.degrees}</p>}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-[color:var(--teal-pale)] p-4">
          <p className="text-xs font-semibold text-[color:var(--text-muted)]">Consultation Fee</p>
          <p className="font-serif text-2xl font-black text-[color:var(--teal)]">৳{doctor.fee.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-[color:var(--teal-pale)] p-4">
          <p className="text-xs font-semibold text-[color:var(--text-muted)]">Availability</p>
          <p className="font-serif text-2xl font-black capitalize text-[color:var(--teal)]">{avail}</p>
          <p className="text-xs text-[color:var(--text-muted)]">{doctor.totalSeats - doctor.usedSeats} / {doctor.totalSeats} slots</p>
        </div>
        <div className="rounded-xl bg-[color:var(--teal-pale)] p-4">
          <p className="text-xs font-semibold text-[color:var(--text-muted)]">Rating</p>
          <p className="font-serif text-2xl font-black text-[color:var(--teal)]">⭐ {doctor.rating}</p>
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href={`/booking/${doctor.id}`} className="flex-1 rounded-xl bg-[color:var(--teal)] py-3 text-center font-semibold text-white hover:bg-[color:var(--teal-light)]">
          Book Appointment
        </Link>
        <Link href="/doctors" className="rounded-xl border border-[color:var(--border)] px-6 py-3 text-sm font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--teal)]">
          Back
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-xl font-black text-[color:var(--teal)]">
          Patient Reviews {totalReviews > 0 && `(${totalReviews})`}
        </h2>
        {reviewsLoading ? (
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-[color:var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[color:var(--teal)]">{review.patientName}</p>
                  <p className="text-sm">{"⭐".repeat(review.rating)}</p>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm text-[color:var(--text-muted)]">{review.comment}</p>
                )}
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-[color:var(--border)] px-3 py-1 text-sm font-semibold text-[color:var(--text-muted)] disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-[color:var(--text-muted)]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-[color:var(--border)] px-3 py-1 text-sm font-semibold text-[color:var(--text-muted)] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
