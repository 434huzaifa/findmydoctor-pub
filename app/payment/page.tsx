"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setBookingInfo } from "@/store/bookingSlice";
import { useCreateAppointmentMutation } from "@/store/fmdApi";
import { formatDateOnly } from "@/lib/datetime";
import { toast } from "sonner";

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const bookingInfo = useAppSelector((s) => s.booking.bookingInfo);
  const pendingBooking = useAppSelector((s) => s.booking.pendingBooking);
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();
  const [error, setError] = useState("");

  // Branch A — pending booking (advance fee required)
  if (pendingBooking) {
    const { form, doctor } = pendingBooking;
    const balanceDue = doctor.fee - doctor.advanceFee;

    async function handlePay() {
      if (!pendingBooking) return;
      setError("");
      try {
        const result = await createAppointment({
          doctorId: pendingBooking.form.doctorId,
          patientName: pendingBooking.form.patientName,
          patientPhone: pendingBooking.form.patientPhone,
          appointmentDate: pendingBooking.form.appointmentDate,
          slot: pendingBooking.form.slot,
          paymentMethod: "online",
          paymentChoice: "advance",
        }).unwrap();
        dispatch(
          setBookingInfo({
            appointment: result,
            doctor: pendingBooking.doctor,
          }),
        );
        router.push("/success");
      } catch (err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        const msg =
          e?.data?.error ?? e?.message ?? "Payment failed. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    }

    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-lg">
          <div className="mb-4 text-5xl">💳</div>
          <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
            Advance Payment
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            Pay the advance to confirm your appointment
          </p>
          <div className="mt-6 space-y-3 text-left text-sm">
            <Row label="Doctor" value={`Dr. ${doctor.name}`} />
            <Row label="Specialty" value={doctor.specialty?.name ?? "-"} />
            <Row label="Patient" value={form.patientName} />
            <Row label="Phone" value={form.patientPhone} />
            <Row label="Date" value={formatDateOnly(form.appointmentDate)} />
            <Row label="Hours" value={form.slot} />
            <div className="border-t border-[color:var(--border)] pt-3">
              <Row
                label="Advance (due now)"
                value={`৳${doctor.advanceFee.toLocaleString()}`}
                highlight
              />
              <Row
                label="Balance (at clinic)"
                value={`৳${balanceDue.toLocaleString()}`}
              />
              <Row
                label="Total Fee"
                value={`৳${doctor.fee.toLocaleString()}`}
              />
            </div>
          </div>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            onClick={handlePay}
            disabled={isLoading}
            className="mt-8 w-full rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-60"
          >
            {isLoading
              ? "Processing..."
              : `Pay ৳${doctor.advanceFee.toLocaleString()} & Confirm`}
          </button>
          <Link
            href={`/booking/${doctor.id}`}
            className="mt-3 block text-sm text-[color:var(--text-muted)] hover:text-[color:var(--teal)]"
          >
            ← Back to booking
          </Link>
        </div>
      </div>
    );
  }

  // Branch B — bookingInfo already set (legacy: appointment already created)
  if (bookingInfo) {
    const { appointment, doctor } = bookingInfo;
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="rounded-2xl border border-[color:var(--border)] bg-white p-8 shadow-lg">
          <div className="mb-4 text-5xl">💳</div>
          <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
            Payment Summary
          </h1>
          <div className="mt-6 space-y-3 text-left text-sm">
            <Row label="Doctor" value={`Dr. ${doctor.name}`} />
            <Row label="Specialty" value={doctor.specialty?.name ?? "-"} />
            <Row label="Patient" value={appointment.patientName} />
            <Row label="Phone" value={appointment.patientPhone} />
            <Row
              label="Date"
              value={formatDateOnly(appointment.appointmentDate)}
            />
            <Row label="Slot" value={appointment.slot} />
            <Row
              label="Amount"
              value={`৳${(appointment.paidAmount ?? appointment.fee).toLocaleString()}`}
            />
          </div>
          <Link
            href="/success"
            className="mt-8 block w-full rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)]"
          >
            View Confirmation
          </Link>
        </div>
      </div>
    );
  }

  // Branch C — nothing in state
  return (
    <div className="py-24 text-center text-[color:var(--text-muted)]">
      No booking found.{" "}
      <Link href="/doctors" className="text-[color:var(--teal)]">
        Find a doctor
      </Link>
    </div>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-semibold text-[color:var(--text-muted)]">
        {label}
      </span>
      <span
        className={`text-right ${highlight ? "font-bold text-[color:var(--teal)]" : "text-[color:var(--text)]"}`}
      >
        {value}
      </span>
    </div>
  );
}
