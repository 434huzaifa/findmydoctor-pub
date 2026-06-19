
"use client";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function SuccessPage() {
  const bookingInfo = useAppSelector((s) => s.booking.bookingInfo);
  const medicineOrderInfo = useAppSelector((s) => s.booking.medicineOrderInfo);

  if (medicineOrderInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-6 font-serif text-4xl font-black text-[color:var(--teal)]">Medicine Order Confirmed!</h1>
        <div className="mt-4 space-y-2 text-sm text-[color:var(--text-muted)]">
          <p>Order ID: <strong className="text-[color:var(--text)]">#{medicineOrderInfo.id}</strong></p>
          <p>Medicine: <strong className="text-[color:var(--text)]">{medicineOrderInfo.medicine.name}</strong></p>
          <p>Quantity: <strong className="text-[color:var(--text)]">{medicineOrderInfo.quantity}</strong></p>
          <p>Phone: <strong className="text-[color:var(--text)]">{medicineOrderInfo.guestPhone}</strong></p>
          <p>Status: <strong className="text-[color:var(--text)]">{medicineOrderInfo.status}</strong></p>
        </div>
        <p className="mt-6 text-sm text-[color:var(--text-muted)]">Your medicine order has been received. We will contact you with delivery details soon.</p>
        <div className="mt-8 flex gap-4">
          <Link href="/medicine" className="rounded-xl border border-[color:var(--teal)] px-6 py-3 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]">
            View Medicines
          </Link>
          <Link href="/" className="rounded-xl bg-[color:var(--teal)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">✅</div>
      <h1 className="mt-6 font-serif text-4xl font-black text-[color:var(--teal)]">Appointment Confirmed!</h1>
      {bookingInfo && (
        <div className="mt-4 space-y-1 text-sm text-[color:var(--text-muted)]">
          <p>Patient: <strong className="text-[color:var(--text)]">{bookingInfo.appointment.patientName}</strong></p>
          <p>Phone: <strong className="text-[color:var(--text)]">{bookingInfo.appointment.patientPhone}</strong></p>
          <p>Date: <strong className="text-[color:var(--text)]">{bookingInfo.appointment.appointmentDate}</strong> · <strong>{bookingInfo.appointment.slot}</strong></p>
        </div>
      )}
      <p className="mt-6 text-sm text-[color:var(--text-muted)]">Save your phone number — you can use it to look up your appointment anytime.</p>
      <div className="mt-8 flex gap-4">
        <Link href="/my-appointments" className="rounded-xl border border-[color:var(--teal)] px-6 py-3 text-sm font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]">
          View My Appointments
        </Link>
        <Link href="/" className="rounded-xl bg-[color:var(--teal)] px-6 py-3 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]">
          Go Home
        </Link>
      </div>
    </div>
  );
}
