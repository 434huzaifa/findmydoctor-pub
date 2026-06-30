"use client";

import { useState, useMemo, type FormEvent } from "react";
import { toast } from "sonner";
import {
  useGetAmbulancesQuery,
  useCallAmbulanceMutation,
} from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";
import { isValidPhone, normalizePhoneInput } from "@/shared/lib/utils";
import type { Ambulance, AmbulanceListParams } from "@/types/domain";

export default function AmbulancesPage() {
  const [search, setSearch] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(
    null
  );
  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  const [callAmbulance, { isLoading: isCalling }] = useCallAmbulanceMutation();

  const queryParams = useMemo<AmbulanceListParams>(() => {
    const result: AmbulanceListParams = { limit: "50" };
    if (search.trim()) result.search = search.trim();
    if (availableOnly) result.availableOnly = "true";
    return result;
  }, [search, availableOnly]);

  const { data, isLoading, isFetching } = useGetAmbulancesQuery(queryParams);
  const ambulances = data?.items ?? [];

  function resetForm() {
    setCallerName("");
    setCallerPhone("");
    setPickupLocation("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedAmbulance) return;
    if (!isValidPhone(callerPhone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    try {
      await callAmbulance({
        ambulanceId: selectedAmbulance.id,
        callerName: callerName.trim(),
        callerPhone: callerPhone.trim(),
        pickupLocation: pickupLocation.trim(),
      }).unwrap();

      toast.success(
        `Ambulance ${selectedAmbulance.vehicleNumber} dispatched! Driver ${selectedAmbulance.driverName} will call you at ${callerPhone}.`
      );
      setSelectedAmbulance(null);
      resetForm();
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ??
          "Failed to dispatch ambulance"
      );
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-600 to-rose-700 py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              🚑 Emergency Ambulance
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Request an ambulance immediately. View real-time availability and
              get help fast.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Search by location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 rounded-xl border-0 bg-white/95 px-4 py-3 text-sm shadow-lg outline-none focus:ring-2 focus:ring-white/50"
            />
            <label className="flex items-center gap-2 bg-white/95 rounded-xl px-4 py-3 cursor-pointer shadow-lg">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">
                Show Available Only
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Ambulance List */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-200 border-t-red-600" />
            </div>
          ) : ambulances.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-12 text-center">
              <p className="text-3xl mb-3">🚑</p>
              <p className="text-[color:var(--text-muted)]">
                No ambulances found for your search.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {ambulances.map((ambulance) => (
                <AmbulanceCard
                  key={ambulance.id}
                  ambulance={ambulance}
                  onCall={() => setSelectedAmbulance(ambulance)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call Modal */}
      <AppModal
        isOpen={!!selectedAmbulance}
        onClose={() => {
          setSelectedAmbulance(null);
          resetForm();
        }}
        title="Call Ambulance"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setSelectedAmbulance(null);
                resetForm();
              }}
              className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm font-medium text-[color:var(--text-muted)] hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="call-form"
              disabled={isCalling}
              className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isCalling ? "Dispatching..." : "🚑 Dispatch Now"}
            </button>
          </>
        }
      >
        {selectedAmbulance && (
          <form id="call-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl bg-red-50 p-4">
              <p className="font-semibold text-red-800">
                🚑 {selectedAmbulance.vehicleNumber}
              </p>
              <p className="text-sm text-red-700">
                Driver: {selectedAmbulance.driverName}
              </p>
              <p className="text-sm text-red-700">
                Base: {selectedAmbulance.baseLocation}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                required
                value={callerPhone}
                onChange={(e) => setCallerPhone(normalizePhoneInput(e.target.value))}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--text)] mb-1">
                Pickup Location *
              </label>
              <textarea
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2 text-sm focus:border-red-500 focus:outline-none resize-none"
                placeholder="Full address with landmarks"
              />
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-xs text-yellow-800">
                ⚠️ The driver will call you immediately after dispatch. Please
                keep your phone accessible.
              </p>
            </div>
          </form>
        )}
      </AppModal>
    </div>
  );
}

function AmbulanceCard({
  ambulance,
  onCall,
}: {
  ambulance: Ambulance;
  onCall: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition hover:shadow-lg ${
        ambulance.isAvailable
          ? "border-green-200"
          : "border-gray-200 opacity-60"
      }`}
    >
      <div
        className={`h-1.5 ${
          ambulance.isAvailable
            ? "bg-gradient-to-r from-green-400 to-emerald-500"
            : "bg-gray-300"
        }`}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚑</span>
            <div>
              <h3 className="font-semibold text-[color:var(--text)]">
                {ambulance.vehicleNumber}
              </h3>
              <p className="text-xs text-[color:var(--text-muted)]">
                {ambulance.driverName}
              </p>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              ambulance.isAvailable
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {ambulance.isAvailable ? "Available" : "Busy"}
          </span>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
            <span>📍</span>
            <span>{ambulance.baseLocation}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
            <span>📞</span>
            <span>{ambulance.driverPhone}</span>
          </div>
        </div>

        <button
          onClick={onCall}
          disabled={!ambulance.isAvailable}
          className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition ${
            ambulance.isAvailable
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {ambulance.isAvailable ? "🚨 Call Ambulance" : "Not Available"}
        </button>
      </div>
    </div>
  );
}
