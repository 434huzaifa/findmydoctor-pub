"use client";

import { useState } from "react";
import { usePhoneLookupQuery } from "@/store/fmdApi";

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
  const [activeTab, setActiveTab] = useState<TabType>("appointments");
  const [pages, setPages] = useState<Record<TabType, number>>({ appointments: 1, orders: 1, ambulance: 1, homevisit: 1 });

  const { data, isLoading, isFetching } = usePhoneLookupQuery(
    { phone: submitted, type: activeTab, page: pages[activeTab], limit: 5 },
    { skip: !submitted }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
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
            💡 Dummy OTP for verification: <span className="font-bold">1234</span>
          </div>

          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="tel" placeholder="Enter your phone number..." value={phone} onChange={(e) => setPhone(e.target.value)} required
              className="flex-1 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none" />
            <button type="submit" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50">
              🔍 Search
            </button>
          </form>
        </div>
      </section>

      {submitted && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <p className="mb-4 text-sm text-gray-500">Results for: <strong>{submitted}</strong></p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    activeTab === tab.key ? "bg-indigo-600 text-white shadow" : "bg-white border text-gray-600 hover:border-indigo-300"
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
                {activeTab === "appointments" && <AppointmentCards items={data.items} />}
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

function AppointmentCards({ items }: { items: any[] }) {
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
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderCards({ items }: { items: any[] }) {
  // Group by createdAt (same minute = same order batch)
  const grouped = new Map<string, any[]>();
  for (const o of items) {
    const key = o.guestPhone + "_" + new Date(o.createdAt).toISOString().slice(0, 16);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(o);
  }

  return (
    <div className="space-y-4">
      {Array.from(grouped.entries()).map(([key, orders]) => {
        const first = orders[0];
        const batchTotal = orders.reduce((sum: number, o: any) => {
          const price = typeof o.medicine?.price === "string" ? parseFloat(o.medicine.price) : (o.medicine?.price ?? 0);
          return sum + price * o.quantity;
        }, 0);

        return (
          <div key={key} className="rounded-2xl border bg-white overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-5">
              {/* Order header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-400">{new Date(first.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">📍 {first.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">৳{batchTotal.toFixed(2)}</p>
                  <StatusBadge status={first.status} />
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-2">
                {orders.map((o: any) => {
                  const price = typeof o.medicine?.price === "string" ? parseFloat(o.medicine.price) : (o.medicine?.price ?? 0);
                  return (
                    <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💊</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{o.medicine?.name ?? `#${o.medicineId}`}</p>
                          <p className="text-xs text-gray-500">{o.medicine?.company} · Qty: {o.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">৳{(price * o.quantity).toFixed(2)}</p>
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
