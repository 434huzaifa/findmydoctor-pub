"use client";
import { useState } from "react";
import {
  useRequestLookupOtpMutation,
  useVerifyLookupOtpMutation,
  useLazyGetAppointmentsByPhoneQuery,
} from "@/store/fmdApi";
import { formatDateOnly } from "@/lib/datetime";

type Step = "phone" | "otp" | "results";

export default function MyAppointmentsPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [requestOtp, { isLoading: isRequesting, error: reqError }] =
    useRequestLookupOtpMutation();
  const [verifyOtp, { isLoading: isVerifying, error: verError }] =
    useVerifyLookupOtpMutation();
  const [getAppointments, { data: appointments, isLoading: isFetching }] =
    useLazyGetAppointmentsByPhoneQuery();

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await requestOtp({ phone }).unwrap();
      setStep("otp");
    } catch {}
  }
  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { otpToken: token } = await verifyOtp({ phone, otp }).unwrap();
      await getAppointments({ phone, otpToken: token });
      setStep("results");
    } catch {}
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
        My Appointments
      </h1>
      <p className="mt-1 text-sm text-[color:var(--text-muted)]">
        Look up your appointments using your phone number
      </p>

      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-4">
          {reqError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Failed to send OTP. Please try again.
            </p>
          )}
          <label className="block text-sm font-semibold">
            Phone Number
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801XXXXXXXXX"
              className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={isRequesting}
            className="w-full rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-60"
          >
            {isRequesting ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="mt-8 space-y-4">
          <p className="rounded-lg bg-[color:var(--teal-pale)] p-3 text-sm text-[color:var(--teal)]">
            OTP sent.
          </p>
          {verError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              Invalid OTP. Please try again.
            </p>
          )}
          <label className="block text-sm font-semibold">
            OTP Code
            <input
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="Enter OTP"
              className="mt-1 block w-full rounded-xl border border-[color:var(--border)] px-4 py-3 text-sm focus:border-[color:var(--teal)] focus:outline-none"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="rounded-xl border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--text-muted)]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 rounded-xl bg-[color:var(--teal)] py-3 font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      )}

      {step === "results" && (
        <div className="mt-8">
          {isFetching ? (
            <p className="text-[color:var(--text-muted)]">
              Loading appointments...
            </p>
          ) : !appointments || appointments.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 text-center">
              <p className="text-[color:var(--text-muted)]">
                No appointments found for this phone number.
              </p>
              <button
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                className="mt-4 text-sm font-semibold text-[color:var(--teal)] underline"
              >
                Try another number
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-[color:var(--border)] bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-serif font-bold text-[color:var(--teal)]">
                        {a.doctorName ?? "Unknown Doctor"}
                      </p>
                      <p className="text-xs text-[color:var(--text-muted)]">
                        {a.doctorSpecIcon} {a.doctorSpec}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${a.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {a.paymentStatus}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[color:var(--text-muted)]">
                    <span>📅 {formatDateOnly(a.appointmentDate)}</span>
                    <span>🕐 {a.slot}</span>
                    <span>💰 ৳{a.fee.toLocaleString()}</span>
                    <span>📱 {a.paymentMethod}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                }}
                className="text-sm font-semibold text-[color:var(--teal)] underline"
              >
                Search another number
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
