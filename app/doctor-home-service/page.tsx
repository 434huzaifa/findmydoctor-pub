"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCreateHomeVisitRequestMutation } from "@/store/fmdApi";
import { isValidPhone, normalizePhoneInput } from "@/shared/lib/utils";

export default function DoctorHomeServicePage() {
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [situation, setSituation] = useState("");

  const [createRequest, { isLoading }] = useCreateHomeVisitRequestMutation();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    try {
      const result = await createRequest({
        patientName: patientName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        situationDescription: situation.trim() || undefined,
      }).unwrap();

      toast.success("Request created! Redirecting to payment...");
      router.push(`/checkout/simulation/${result.id}`);
    } catch (error: unknown) {
      toast.error(
        (error as { data?: { message?: string } })?.data?.message ??
          "Failed to create request"
      );
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-700 to-indigo-800 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 mb-6">
            <span className="text-4xl sm:text-5xl">🏠</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Emergency Home Doctor Visit
          </h1>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/80 max-w-xl mx-auto">
            Can&apos;t make it to the hospital? Request an emergency doctor to
            visit your home.
          </p>

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="mt-6 sm:mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl transition hover:bg-red-600 hover:scale-105 animate-pulse"
            >
              🚨 REQUEST EMERGENCY DOCTOR (৳5,000)
            </button>
          )}
        </div>
      </section>

      {/* Form */}
      {step === 2 && (
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-lg px-4 sm:px-6">
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 sm:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--text)] mb-6">
                Patient Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text)] mb-1.5">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="Full name of the patient"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--text)] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    required
                    value={phone}
                    onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                    className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--text)] mb-1.5">
                    Home Address *
                  </label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
                    placeholder="House #, Road #, Area, City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[color:var(--text)] mb-1.5">
                    Describe the Situation
                  </label>
                  <textarea
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-100 resize-none"
                    placeholder="What symptoms or emergency is the patient experiencing?"
                  />
                </div>

                <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-purple-700">Service Fee</span>
                    <span className="text-2xl font-bold text-purple-700">
                      ৳5,000
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-purple-600">
                    Payment required before doctor dispatch
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-[color:var(--border)] py-3 text-sm font-medium text-[color:var(--text-muted)] hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Next: Payment →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      {step === 1 && (
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white border border-[color:var(--border)] p-6 text-center">
                <span className="text-3xl">⏱️</span>
                <h3 className="mt-3 font-semibold text-[color:var(--text)]">
                  30-Min Response
                </h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Doctor arrives within 30 minutes of confirmed payment
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[color:var(--border)] p-6 text-center">
                <span className="text-3xl">💳</span>
                <h3 className="mt-3 font-semibold text-[color:var(--text)]">
                  Secure Payment
                </h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Pay online securely before the visit
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-[color:var(--border)] p-6 text-center">
                <span className="text-3xl">👨‍⚕️</span>
                <h3 className="mt-3 font-semibold text-[color:var(--text)]">
                  Qualified Doctors
                </h3>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Experienced physicians for emergency care
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
