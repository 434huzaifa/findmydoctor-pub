"use client";

import { use } from "react";
import Link from "next/link";
import { useGetHomeVisitRequestQuery } from "@/store/fmdApi";

export default function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: request, isLoading } = useGetHomeVisitRequestQuery(
    parseInt(id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-green-50 p-4">
              <p className="text-sm text-green-700 font-medium">
                🎉 Your home doctor visit request has been confirmed!
              </p>
            </div>

            {request && (
              <div className="text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-muted)]">
                    Request ID
                  </span>
                  <span className="font-mono font-medium">#{request.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-muted)]">
                    Patient
                  </span>
                  <span className="font-medium">{request.patientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[color:var(--text-muted)]">
                    Amount Paid
                  </span>
                  <span className="font-bold text-green-600">
                    ৳{typeof request.amount === "string" ? parseFloat(request.amount).toLocaleString() : request.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="border-t border-[color:var(--border)] pt-4">
              <p className="text-sm text-[color:var(--text-muted)] mb-4">
                A doctor will arrive at your location within 30 minutes. Please
                keep your phone accessible.
              </p>

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
    </div>
  );
}
