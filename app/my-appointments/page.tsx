"use client";

import { useState, type FormEvent } from "react";
import {
  usePhoneLookupQuery,
  useGetAppointmentRemindersQuery,
  useSubmitReviewMutation,
} from "@/store/fmdApi";
import { isValidPhone, normalizePhoneInput } from "@/shared/lib/utils";
import { useOtpVerification } from "@/shared/hooks";
import { toast } from "sonner";
import { AppModal } from "@/components/common/AppModal";

type TabType = "appointments" | "orders" | "ambulance" | "homevisit";

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: "appointments", label: "Appointments", icon: "📅" },
  { key: "orders", label: "Medicine Orders", icon: "💊" },
  { key: "ambulance", label: "Ambulance Calls", icon: "🚑" },
  { key: "homevisit", label: "Home Visits", icon: "🏠" },
];

export default function MyCornerPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const otp = useOtpVerification(phone.trim());
  const [activeTab, setActiveTab] = useState<TabType>("appointments");
  const [pages, setPages] = useState<Record<TabType, number>>({ appointments: 1, orders: 1, ambulance: 1, homevisit: 1 });

  const { data, isLoading, isFetching } = usePhoneLookupQuery(
    { phone: submitted, type: activeTab, page: pages[activeTab], limit: 5 },
    { skip: !submitted }
  );

  const { data: reminders } = useGetAppointmentRemindersQuery(
    { phone: submitted, otpToken },
    { skip: !submitted || !otpToken }
  );

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    if (!isValidPhone(phone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    if (otp.step === "info") {
      await otp.goToOtpStep();
      return;
    }

    try {
      const token = await otp.verify();
      setOtpToken(token);
    } catch {
      toast.error("Invalid OTP.");
      return;
    }

    setSubmitted(phone.trim());
    setPages({ appointments: 1, orders: 1, ambulance: 1, homevisit: 1 });
  }

  function setPageFor(tab: TabType, p: number) {
    setPages((prev) => ({ ...prev, [tab]: p }));
  }

  const loading = isLoading || isFetching;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">🏠 My Corner</h1>
          <p className="mt-2 text-sm sm:text-base text-white/80">Enter your phone number to see all your activities — appointments, medicine orders, ambulance calls, and home visits.</p>
          <div className="mt-4 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-medium text-white">
          </div>

          <form onSubmit={handleSearch} className="mt-6 max-w-md mx-auto space-y-3">
            {otp.step === "info" ? (
              <input type="tel" inputMode="numeric" maxLength={11} placeholder="Enter your phone number..." value={phone} onChange={(e) => setPhone(normalizePhoneInput(e.target.value))} required
                className="w-full rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
            ) : (
              <>
                <input type="tel" inputMode="numeric" maxLength={11} value={phone} readOnly
                  className="w-full rounded-xl border-0 bg-white/80 px-4 py-3 text-sm shadow-lg outline-none" />
                <input type="text" inputMode="numeric" maxLength={4} placeholder="Enter 4-digit OTP" value={otp.otpValue}
                  onChange={(e) => otp.setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 4))} required
                  className="w-full rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
                <button type="button" onClick={otp.goToOtpStep} disabled={otp.isRequesting}
                  className="text-xs text-white/80 underline disabled:opacity-50">
                  {otp.isRequesting ? "Resending..." : "Resend OTP"}
                </button>
              </>
            )}
            <button type="submit" disabled={otp.isRequesting || otp.isVerifying} className="w-full rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50 disabled:opacity-50">
              {otp.step === "info" ? "🔍 Search" : "Verify & Confirm"}
            </button>
          </form>
        </div>
      </section>

      {submitted && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 text-sm text-gray-500">Results for: <strong>{submitted}</strong></p>

            {reminders && reminders.length > 0 && (
              <div className="mb-6 space-y-2">
                {reminders.map((n) => (
                  <div key={n.id} className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                    <span className="text-xl">⏰</span>
                    <p className="text-sm text-amber-800">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === tab.key ? "bg-indigo-600 text-white shadow" : "bg-white border text-gray-600 hover:border-indigo-300"
                    }`}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="rounded-2xl border bg-white p-12 text-center">
                <p className="text-3xl mb-3">{TABS.find((t) => t.key === activeTab)?.icon}</p>
                <p className="text-gray-500">No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} found.</p>
              </div>
            ) : (
              <>
                {activeTab === "appointments" && (
                  <AppointmentCards items={data.items} phone={submitted} otpToken={otpToken} />
                )}
                {activeTab === "orders" && <OrderCards items={data.items} />}
                {activeTab === "ambulance" && <AmbulanceCards items={data.items} />}
                {activeTab === "homevisit" && <HomeVisitCards items={data.items} />}

                {data.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Page {data.page} of {data.totalPages} ({data.total} total)</p>
                    <div className="flex gap-2">
                      <button disabled={data.page <= 1} onClick={() => setPageFor(activeTab, data.page - 1)}
                        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">← Prev</button>
                      <button disabled={data.page >= data.totalPages} onClick={() => setPageFor(activeTab, data.page + 1)}
                        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50">Next →</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function AppointmentCards({ items, phone, otpToken }: { items: any[]; phone: string; otpToken: string }) {
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      {items.map((a) => (
        <div key={a.id} className="rounded-2xl border bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg shrink-0">
                  {a.doctor?.specialty?.icon ?? "🩺"}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{a.doctor?.name ?? `Doctor #${a.doctorId}`}</p>
                  <p className="text-sm text-gray-500">{a.doctor?.specialty?.name} · {a.doctor?.hospital}</p>
                  {a.doctor?.roomNumber && <p className="text-xs text-blue-600">📍 Room: {a.doctor.roomNumber}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <span>📅 {a.appointmentDate}</span>
                    <span>🕐 {a.slot}</span>
                    <span>👤 {a.patientName}</span>
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-blue-600">৳{a.fee}</p>
                <StatusBadge status={a.paymentStatus} />
                {a.paidAmount != null && <p className="text-xs text-green-600 mt-1">Paid: ৳{a.paidAmount}</p>}
                {a.amountDue > 0 && <p className="text-xs text-red-500">Due: ৳{a.amountDue}</p>}
              </div>
            </div>
            {a.prescriptionText && (
              <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-xs font-semibold text-purple-700 mb-1.5">📝 Prescription</p>
                <pre className="whitespace-pre-wrap text-sm text-purple-900 font-mono leading-relaxed">{a.prescriptionText}</pre>
              </div>
            )}
            {a.status === "completed" && (
              <div className="mt-4">
                {a.hasReview ? (
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    ✓ Review submitted
                  </span>
                ) : (
                  <button
                    onClick={() => setReviewTarget(a)}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                  >
                    ⭐ Rate this visit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {reviewTarget && (
        <RateVisitModal
          appointment={reviewTarget}
          phone={phone}
          otpToken={otpToken}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}

function RateVisitModal({
  appointment,
  phone,
  otpToken,
  onClose,
}: {
  appointment: any;
  phone: string;
  otpToken: string;
  onClose: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  async function handleSubmit() {
    try {
      await submitReview({
        appointmentId: appointment.id,
        phone,
        otpToken,
        rating,
        comment: comment.trim() || undefined,
      }).unwrap();
      toast.success("Thanks for your feedback!");
      onClose();
    } catch (e: any) {
      toast.error(e?.error ?? "Could not submit review.");
    }
  }

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title={`Rate your visit with ${appointment.doctor?.name ?? "your doctor"}`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-2xl"
              >
                {n <= rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Comment (optional)</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-indigo-400"
            placeholder="Share your experience..."
          />
        </div>
      </div>
    </AppModal>
  );
}

function OrderCards({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      {items.map((order) => {
        const total = typeof order.total === "string" ? parseFloat(order.total) : order.total;

        return (
          <div key={order.id} className="rounded-2xl border bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-5">
              {/* Order header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">Order #{order.id} · {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">📍 {order.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">৳{total.toFixed(2)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-2">
                {(order.items ?? []).map((item: any) => {
                  const price = typeof item.unitPrice === "string" ? parseFloat(item.unitPrice) : item.unitPrice;
                  return (
                    <div key={item.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💊</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.medicine?.name ?? `#${item.medicineId}`}</p>
                          <p className="text-xs text-gray-500">{item.medicine?.company} · Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">৳{(price * item.quantity).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AmbulanceCards({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      {items.map((d) => (
        <div key={d.id} className="rounded-2xl border bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🚑</span>
                <div>
                  <p className="font-semibold text-gray-900">{d.ambulance?.vehicleNumber ?? `#${d.ambulanceId}`}</p>
                  <p className="text-sm text-gray-500">Driver: {d.ambulance?.driverName} · {d.ambulance?.driverPhone}</p>
                  <p className="text-sm text-gray-500">📍 Pickup: {d.pickupLocation}</p>
                  {d.startTime && d.endTime && (
                    <p className="text-sm text-gray-500">
                      🕒 {new Date(d.startTime).toLocaleString()} → {new Date(d.endTime).toLocaleString()}
                    </p>
                  )}
                  {d.totalCost != null && (
                    <p className="text-sm font-medium text-gray-700">
                      💳 Total Cost: ৳{typeof d.totalCost === "string" ? parseFloat(d.totalCost) : d.totalCost}
                    </p>
                  )}
                  {d.ambulance?.detailedDescription && (
                    <p className="text-sm text-gray-500 mt-1 border-t border-dashed pt-1">
                      {d.ambulance.detailedDescription}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{new Date(d.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeVisitCards({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      {items.map((h) => (
        <div key={h.id} className="rounded-2xl border bg-white overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-400 to-indigo-500" />
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">🏠 {h.patientName}</p>
                <p className="text-sm text-gray-500">📍 {h.address}</p>
                {h.situationDescription && <p className="text-sm text-gray-400 mt-1">{h.situationDescription}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(h.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-purple-600">৳{typeof h.amount === "string" ? parseFloat(h.amount) : h.amount}</p>
                <StatusBadge status={h.isPaid ? "paid" : "unpaid"} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    paid: "bg-green-100 text-green-700", partial: "bg-yellow-100 text-yellow-700",
    unpaid: "bg-red-100 text-red-700", pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700", delivered: "bg-green-100 text-green-700",
    dispatched: "bg-orange-100 text-orange-700", completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
