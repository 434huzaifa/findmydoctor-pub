"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function SuccessPage() {
  const bookingInfo = useAppSelector((s) => s.booking.bookingInfo);
  const medicineOrder = useAppSelector((s) => s.booking.medicineOrderInfo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-white border border-green-200 shadow-xl overflow-hidden text-center">
          {/* Success Icon */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Success!</h1>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            {bookingInfo && (
              <div className="text-left">
                <h3 className="font-semibold text-[color:var(--text)] mb-2">
                  Appointment Confirmed
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Doctor:{" "}
                    </span>
                    {bookingInfo.doctor.name}
                  </p>
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Date:{" "}
                    </span>
                    {bookingInfo.appointment.appointmentDate}
                  </p>
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Slot:{" "}
                    </span>
                    {bookingInfo.appointment.slot}
                  </p>
                </div>
              </div>
            )}

            {medicineOrder && (
              <div className="text-left">
                <h3 className="font-semibold text-[color:var(--text)] mb-2">
                  Order Placed
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Order ID:{" "}
                    </span>
                    #{medicineOrder.id}
                  </p>
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Medicine:{" "}
                    </span>
                    {medicineOrder.medicine.name}
                  </p>
                  <p>
                    <span className="text-[color:var(--text-muted)]">
                      Quantity:{" "}
                    </span>
                    {medicineOrder.quantity}
                  </p>
                </div>
              </div>
            )}

            {!bookingInfo && !medicineOrder && (
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  Your request has been processed successfully!
                </p>
              </div>
            )}

            <Link
              href="/"
              className="block w-full rounded-xl bg-[color:var(--teal)] py-3 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)]"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
