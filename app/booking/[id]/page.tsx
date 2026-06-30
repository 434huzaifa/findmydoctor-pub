"use client";

import { use, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetDoctorQuery,
  useGetOnlineDoctorsQuery,
  useJoinConsultationQueueMutation,
  useCreateAppointmentMutation,
} from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";
import { isValidPhone, normalizePhoneInput } from "@/shared/lib/utils";

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: doctor, isLoading } = useGetDoctorQuery(parseInt(id));
  const { data: onlineDoctors } = useGetOnlineDoctorsQuery(undefined, { pollingInterval: 5000 });

  const [joinQueue, { isLoading: isJoining }] = useJoinConsultationQueueMutation();
  const [createAppointment, { isLoading: isBooking }] = useCreateAppointmentMutation();

  // Video modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");

  // In-person booking modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [otpStep, setOtpStep] = useState<"info" | "otp">("info");
  const [otpValue, setOtpValue] = useState("");
  const [bName, setBName] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bDate, setBDate] = useState("");
  const [bSlot, setBSlot] = useState("10:00 AM - 10:30 AM");
  const [bPaymentMethod, setBPaymentMethod] = useState<"online" | "cash">("online");
  const [bPaymentChoice, setBPaymentChoice] = useState<"full" | "advance">("full");

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;
  }
  if (!doctor) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Doctor not found</p></div>;
  }

  const isCurrentlyOnline = onlineDoctors?.some((d) => d.id === doctor.id) ?? false;
  const availableSlots = doctor.totalSeats - doctor.usedSeats;
  const hasAdvance = doctor.advanceFee > 0;

  const today = new Date().toISOString().split("T")[0];

  const timeSlots = [
    "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM", "03:00 PM - 03:30 PM",
    "03:30 PM - 04:00 PM", "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM",
  ];

  async function handleJoinQueue(e: FormEvent) {
    e.preventDefault();
    if (!doctor || !vName.trim() || !vPhone.trim()) return;
    if (!isValidPhone(vPhone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }
    try {
      const result = await joinQueue({ doctorId: doctor.id, patientName: vName.trim(), patientPhone: vPhone.trim() }).unwrap();
      toast.success("Joined queue!");
      setShowVideoModal(false);
      router.push(`/consultation/wait/${result.id}`);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message ?? "Failed");
    }
  }

  async function handleBookAppointment(e: FormEvent) {
    e.preventDefault();
    if (!doctor || !bName.trim() || !bPhone.trim() || !bDate || !bSlot) return;
    if (!isValidPhone(bPhone)) {
      toast.error("Phone number must be exactly 11 digits.");
      return;
    }

    if (otpStep === "info") {
      setOtpStep("otp");
      return;
    }

    if (otpValue !== "1234") {
      toast.error("Invalid OTP. Please enter the correct dummy OTP (1234).");
      return;
    }

    try {
      // Fake payment for online
      if (bPaymentMethod === "online") {
        toast.loading("Processing payment...");
        await new Promise((r) => setTimeout(r, 1500));
        toast.dismiss();
        toast.success("Payment successful!");
      }

      await createAppointment({
        doctorId: doctor.id,
        patientName: bName.trim(),
        patientPhone: bPhone.trim(),
        appointmentDate: bDate,
        slot: bSlot,
        paymentMethod: bPaymentMethod,
        paymentChoice: hasAdvance ? bPaymentChoice : undefined,
      }).unwrap();

      toast.success("Appointment booked successfully!");
      setShowBookingModal(false);
      setOtpStep("info");
      setOtpValue("");
      router.push("/success");
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message ?? "Booking failed");
    }
  }

  const payableAmount = bPaymentMethod === "cash" ? 0 : bPaymentChoice === "advance" ? doctor.advanceFee : doctor.fee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border shadow-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

          <div className="p-6 sm:p-8">
            {/* Doctor Info */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 text-5xl shrink-0 mx-auto sm:mx-0">
                {doctor.specialty?.icon || "👨‍⚕️"}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-blue-600 font-medium">{doctor.specialty?.name}</p>
                <p className="text-gray-500 text-sm">{doctor.degrees}</p>
                <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start text-sm text-gray-600">
                  <span>🏥 {doctor.hospital}</span>
                  <span>📍 {doctor.city}{doctor.roomNumber && ` · Room ${doctor.roomNumber}`}</span>
                  <span>⭐ {doctor.rating} · {doctor.exp} years</span>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-3xl font-bold text-blue-600">৳{doctor.fee}</p>
                {hasAdvance && <p className="text-sm text-gray-500">Advance: ৳{doctor.advanceFee}</p>}
              </div>
            </div>

            {/* Video Call */}
            {isCurrentlyOnline && (
              <div className="mt-6 rounded-xl bg-green-50 border-2 border-green-300 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl animate-pulse">🟢</span>
                    <div>
                      <p className="font-semibold text-green-800">{doctor.name} is LIVE Now!</p>
                      <p className="text-sm text-green-600">Join the queue for instant video consultation</p>
                    </div>
                  </div>
                  <button onClick={() => setShowVideoModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 animate-pulse text-lg">
                    🎥 Join Live Queue
                  </button>
                </div>
              </div>
            )}

            {!isCurrentlyOnline && (
              <div className="mt-6 rounded-xl bg-gray-100 border border-gray-200 p-4 text-center">
                <p className="text-gray-500 text-sm">⚪ Not available for video calls right now. Book an in-person appointment below.</p>
              </div>
            )}

            {/* Chamber & Availability */}
            {doctor.chamberAddress && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Chamber Address</h3>
                <p className="text-gray-600">{doctor.chamberAddress}</p>
                {doctor.chamberOpenTime && doctor.chamberCloseTime && (
                  <p className="text-sm text-gray-500 mt-1">Hours: {doctor.chamberOpenTime} – {doctor.chamberCloseTime}</p>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-4">
              <div className="flex-1 rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{availableSlots}</p>
                <p className="text-sm text-blue-700">Slots Available</p>
              </div>
              <div className="flex-1 rounded-xl bg-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{doctor.usedSeats}</p>
                <p className="text-sm text-gray-500">Already Booked</p>
              </div>
            </div>

            {/* Book In-Person */}
            <div className="mt-8">
              <button onClick={() => setShowBookingModal(true)} disabled={availableSlots <= 0}
                className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                📅 Book Appointment
              </button>
              {availableSlots <= 0 && <p className="mt-2 text-center text-sm text-red-500">No slots available. Please try another date.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Video Queue Modal */}
      <AppModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} title="Join Video Consultation"
        footer={
          <>
            <button onClick={() => setShowVideoModal(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" form="video-form" disabled={isJoining}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {isJoining ? "Joining..." : "🎥 Join Queue"}
            </button>
          </>
        }>
        <form id="video-form" onSubmit={handleJoinQueue} className="space-y-4">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm text-green-800"><strong>{doctor.name}</strong> is online. Full video with chat, screen sharing & reactions.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Your Name *</label>
            <input type="text" required value={vName} onChange={(e) => setVName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input type="tel" inputMode="numeric" maxLength={11} required value={vPhone} onChange={(e) => setVPhone(normalizePhoneInput(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="+880 1XXX-XXXXXX" />
          </div>
        </form>
      </AppModal>

      {/* In-Person Booking Modal */}
      <AppModal isOpen={showBookingModal} onClose={() => { setShowBookingModal(false); setOtpStep("info"); setOtpValue(""); }} title={otpStep === "info" ? "Book Appointment" : "OTP Verification"} size="lg"
        footer={
          <>
            <button onClick={() => { setShowBookingModal(false); setOtpStep("info"); setOtpValue(""); }} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" form="booking-form" disabled={isBooking}
              className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {isBooking ? "Booking..." : otpStep === "info" ? (bPaymentMethod === "online" ? `💳 Pay ৳${payableAmount} & Book` : "📅 Book Now") : "Verify & Confirm"}
            </button>
          </>
        }>
        <form id="booking-form" onSubmit={handleBookAppointment} className="space-y-4">
          {otpStep === "info" ? (
            <>
              <div className="rounded-xl bg-blue-50 p-4">
                <p className="font-semibold text-blue-900">{doctor.name}</p>
                <p className="text-sm text-blue-700">{doctor.specialty?.name} · {doctor.hospital}</p>
                <p className="text-lg font-bold text-blue-600 mt-1">৳{doctor.fee}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Patient Name *</label>
                  <input type="text" required value={bName} onChange={(e) => setBName(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input type="tel" inputMode="numeric" maxLength={11} required value={bPhone} onChange={(e) => setBPhone(normalizePhoneInput(e.target.value))} className="w-full rounded-lg border px-3 py-2.5 text-sm" placeholder="+880 1XXX-XXXXXX" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Appointment Date *</label>
                  <input type="date" required min={today} value={bDate} onChange={(e) => setBDate(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Slot *</label>
                  <select required value={bSlot} onChange={(e) => setBSlot(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm">
                    {timeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={bPaymentMethod === "online"} onChange={() => setBPaymentMethod("online")} />
                    <span className="text-sm">Online Payment</span>
                  </label>
                  {!hasAdvance && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={bPaymentMethod === "cash"} onChange={() => setBPaymentMethod("cash")} />
                      <span className="text-sm">Cash at Clinic</span>
                    </label>
                  )}
                </div>
              </div>

              {hasAdvance && bPaymentMethod === "online" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Amount</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={bPaymentChoice === "full"} onChange={() => setBPaymentChoice("full")} />
                      <span className="text-sm">Full: ৳{doctor.fee}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={bPaymentChoice === "advance"} onChange={() => setBPaymentChoice("advance")} />
                      <span className="text-sm">Advance: ৳{doctor.advanceFee}</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-3 flex justify-between text-sm">
                <span>{bPaymentMethod === "cash" ? "Pay at clinic" : "Pay now"}</span>
                <span className="font-bold">৳{payableAmount}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">Please enter the 4-digit OTP sent to your phone to confirm your appointment.</p>
              <input 
                type="text" 
                maxLength={4} 
                value={otpValue} 
                onChange={(e) => setOtpValue(e.target.value)} 
                className="w-32 text-center text-2xl tracking-widest rounded-lg border-2 border-blue-600 px-2 py-2 outline-none" 
                placeholder="0000"
                autoFocus
              />
              <p className="mt-4 text-xs text-gray-400">(Dummy OTP is 1234)</p>
            </div>
          )}
        </form>
      </AppModal>
    </div>
  );
}
