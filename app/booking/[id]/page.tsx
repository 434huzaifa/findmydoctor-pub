"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetDoctorQuery,
  useCreateAppointmentMutation,
} from "@/store/fmdApi";
import { setBookingInfo, setPendingBooking } from "@/store/bookingSlice";
import { useAppDispatch } from "@/store/hooks";

// ── Helpers (no hooks, safe at module level) ───────────────────────────────

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = parseInt(mStr ?? "0", 10);
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function deriveSlot(open?: string | null, close?: string | null): string {
  if (open && close) return `${formatTime(open)} – ${formatTime(close)}`;
  if (open) return `From ${formatTime(open)}`;
  return "As scheduled";
}

// Shift a UTC ISO timestamp to Dhaka (UTC+6) and extract YYYY-MM-DD
function deriveDate(utcIso: string): string {
  const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
  const local = new Date(new Date(utcIso).getTime() + DHAKA_OFFSET_MS);
  return local.toISOString().slice(0, 10);
}

function formatDisplayDate(isoDate: string): string {
  // isoDate is already YYYY-MM-DD in Dhaka time — parse as local to avoid off-by-one
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y!, m! - 1, d!).toLocaleDateString("en-BD", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BookingPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = use(params);
  const { data: doctor, isLoading } = useGetDoctorQuery(id);
  const [createAppointment, { isLoading: isSubmitting }] =
    useCreateAppointmentMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [form, setForm] = useState({ patientName: "", patientPhone: "" });
  const [error, setError] = useState("");

  if (isLoading)
    return (
      <div className="py-24 text-center text-[color:var(--text-muted)]">
        Loading...
      </div>
    );
  if (!doctor)
    return (
      <div className="py-24 text-center text-red-500">Doctor not found.</div>
    );

  // No schedule yet
  if (!doctor.nextAppointment) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="text-5xl">📅</div>
        <h1 className="mt-4 font-serif text-2xl font-black text-[color:var(--teal)]">
          No Appointments Available
        </h1>
        <p className="mt-3 text-sm text-[color:var(--text-muted)]">
          Dr. {doctor.name} has not set a schedule yet. Please check back later.
        </p>
      </div>
    );
  }

  const appointmentDate = deriveDate(doctor.nextAppointment);
  const slot = deriveSlot(doctor.chamberOpenTime, doctor.chamberCloseTime);
  const hasAdvanceFee = doctor.advanceFee > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!doctor) return;
    setError("");

    const bookingForm = {
      doctorId: doctor.id,
      patientName: form.patientName,
      patientPhone: form.patientPhone,
      appointmentDate,
      slot,
    };

    if (hasAdvanceFee) {
      // Gate behind payment — don't create appointment yet
      dispatch(setPendingBooking({ form: bookingForm, doctor }));
      router.push("/payment");
      return;
    }

    // Free / cash appointment — create immediately
    try {
      const result = await createAppointment({
        ...bookingForm,
        paymentMethod: "cash",
        paymentChoice: "full",
      }).unwrap();
      dispatch(setBookingInfo({ appointment: result, doctor }));
      router.push("/success");
    } catch (err: unknown) {
      const e = err as { data?: { error?: string }; message?: string };
      setError(
        e?.data?.error ?? e?.message ?? "Booking failed. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
        Book Appointment
      </h1>
      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
        with {doctor.name} · {doctor.specialty?.name}
      </p>

      {/* Appointment info card */}
      <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--teal-pale)] p-5 space-y-3 text-sm">
        <InfoRow label="📅 Date" value={formatDisplayDate(appointmentDate)} />
        <InfoRow label="🕐 Chamber Hours" value={slot} />
        {doctor.chamberAddress && (
          <InfoRow label="📍 Chamber" value={doctor.chamberAddress} />
        )}
        {doctor.hospital && (
          <InfoRow
            label="🏥 Hospital"
            value={`${doctor.hospital}${doctor.city ? `, ${doctor.city}` : ""}`}
          />
        )}
        <div className="border-t border-[color:var(--border)] pt-3 flex justify-between">
          <span className="font-semibold text-[color:var(--text-muted)]">
            Consultation Fee
          </span>
          <span className="font-bold text-[color:var(--text)]">
            ৳{doctor.fee.toLocaleString()}
          </span>
        </div>
        {hasAdvanceFee && (
          <div className="flex justify-between">
            <span className="font-semibold text-[color:var(--text-muted)]">
              Advance Fee (due now)
            </span>
            <span className="font-bold text-[color:var(--teal)]">
              ৳{doctor.advanceFee.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Advance fee warning */}
      {hasAdvanceFee && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠️ This doctor requires an advance payment of{" "}
          <strong>৳{doctor.advanceFee.toLocaleString()}</strong> to confirm your
          appointment. The remaining{" "}
          <strong>৳{(doctor.fee - doctor.advanceFee).toLocaleString()}</strong>{" "}
          will be collected at the clinic.
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          Patient Name
          <input
            required
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            placeholder="Full name"
            className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
          />
        </label>
        <label className="block text-sm font-semibold">
          Phone Number
          <input
            required
            type="tel"
            value={form.patientPhone}
            onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
            placeholder="01XXXXXXXXX"
            className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-60"
        >
          {isSubmitting
            ? "Booking..."
            : hasAdvanceFee
              ? `Proceed to Pay ৳${doctor.advanceFee.toLocaleString()}`
              : "Confirm Booking"}
        </button>
      </form>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-semibold text-[color:var(--text-muted)] shrink-0">
        {label}
      </span>
      <span className="text-right text-[color:var(--text)]">{value}</span>
    </div>
  );
}
