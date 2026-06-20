"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetHomeVisitRequestQuery,
  useSimulatePaymentMutation,
} from "@/store/fmdApi";

export default function CheckoutSimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: request, isLoading } = useGetHomeVisitRequestQuery(
    parseInt(id)
  );
  const [simulatePayment, { isLoading: isPaying }] =
    useSimulatePaymentMutation();

  async function handlePayment() {
    try {
      toast.loading("Processing payment simulation...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate delay
      toast.dismiss();

      await simulatePayment(parseInt(id)).unwrap();
      toast.success("Payment successful!");
      router.push(`/checkout/success/${id}`);
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ??
          "Payment failed"
      );
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Request not found</p>
        </div>
      </div>
    );
  }

  if (request.isPaid) {
    router.push(`/checkout/success/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl bg-white border border-[color:var(--border)] shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
            <h1 className="text-xl font-bold text-white">Payment Checkout</h1>
            <p className="mt-1 text-sm text-white/80">
              Home Doctor Visit Request
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-[color:var(--text)] mb-2">
                Request Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-muted)]">
                    Patient
                  </span>
                  <span className="font-medium">{request.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-muted)]">Phone</span>
                  <span className="font-medium">{request.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[color:var(--text-muted)]">
                    Address
                  </span>
                  <span className="font-medium text-right max-w-[60%]">
                    {request.address}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-[color:var(--border)] pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-[color:var(--text)]">
                  Total Due
                </span>
                <span className="text-3xl font-bold text-purple-600">
                  ৳{typeof request.amount === "string" ? parseFloat(request.amount).toLocaleString() : request.amount.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePayment}
                disabled={isPaying}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-base font-bold text-white shadow-lg transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {isPaying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  "💳 Pay Now"
                )}
              </button>

              <p className="mt-3 text-xs text-center text-[color:var(--text-muted)]">
                By clicking, you agree to our terms of service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
