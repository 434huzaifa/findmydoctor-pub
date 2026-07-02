"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDoctorDashboardQuery,
  useMarkAppointmentPaidMutation,
  useGetDoctorQueueQuery,
  useAcceptPatientMutation,
  useSavePrescriptionMutation,
  useSaveAppointmentPrescriptionMutation,
  useToggleDoctorOnlineMutation,
  useGetDoctorQuery,
} from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";
import type { ApiAppointment, VirtualConsultation } from "@/types/domain";

type AppointmentStatus = "all" | "upcoming" | "completed" | "cancelled";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  // All hooks must be called unconditionally (before any early return)
  const [dateRange] = useState({ from: "", to: "" });
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus>("all");
  const [selectedAppointment, setSelectedAppointment] =
    useState<ApiAppointment | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const [selectedConsultation, setSelectedConsultation] =
    useState<VirtualConsultation | null>(null);
  const [prescriptionForAppointment, setPrescriptionForAppointment] =
    useState<ApiAppointment | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");

  const doctorId = user?.doctorId || undefined;

  const { data: doctorDetails } = useGetDoctorQuery(doctorId!, {
    skip: !doctorId,
  });

  const { data: dashboard, isLoading } = useGetDoctorDashboardQuery(
    {
      doctorId,
      from: dateRange.from || undefined,
      to: dateRange.to || undefined,
    },
    { skip: !user }
  );

  const { data: consultationQueue, refetch: refetchQueue } =
    useGetDoctorQueueQuery(doctorId!, {
      skip: !doctorId,
      pollingInterval: 5000,
    });

  const [markPaid] = useMarkAppointmentPaidMutation();
  const [acceptPatient] = useAcceptPatientMutation();
  const [savePrescription] = useSavePrescriptionMutation();
  const [saveAppointmentPrescription] = useSaveAppointmentPrescriptionMutation();
  const [toggleOnline] = useToggleDoctorOnlineMutation();

  // Early return AFTER all hooks
  if (!user) {
    router.push("/login");
    return null;
  }

  const isOnline = doctorDetails?.isOnlineForVideo ?? false;
  const summary = dashboard?.summary;
  const allAppointments = dashboard?.items || [];

  // Filtered appointments
  const appointments = allAppointments.filter((apt) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "upcoming") return apt.status === "scheduled";
    if (statusFilter === "completed") return apt.status === "completed";
    if (statusFilter === "cancelled") return apt.status === "cancelled";
    return true;
  });

  const waitingPatients = consultationQueue?.filter((c) => c.status === "waiting") || [];
  const isPrescriptionModalOpen = !!selectedConsultation || !!prescriptionForAppointment;

  const handleMarkPaid = async () => {
    if (!selectedAppointment || !payAmount) return;
    try {
      await markPaid({
        id: selectedAppointment.id,
        paidAmount: Number(payAmount),
        doctorId,
      }).unwrap();
      toast.success("Payment recorded");
      setSelectedAppointment(null);
      setPayAmount("");
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handleAcceptPatient = async (id: number) => {
    try {
      await acceptPatient(id).unwrap();
      toast.success("Patient accepted! Jitsi room created.");
      refetchQueue();
    } catch {
      toast.error("Failed to accept patient");
    }
  };

  const handleToggleOnline = async () => {
    if (!doctorId) return;
    try {
      await toggleOnline({ doctorId, isOnlineForVideo: !isOnline }).unwrap();
      toast.success(isOnline ? "You are now offline" : "You are now online for video calls!");
    } catch {
      toast.error("Failed to toggle online status");
    }
  };

  const handleSavePrescription = async () => {
    if (!prescriptionText.trim()) return;

    try {
      if (selectedConsultation) {
        await savePrescription({
          id: selectedConsultation.id,
          prescriptionText: prescriptionText,
        }).unwrap();
        toast.success("Prescription saved!");
      } else if (prescriptionForAppointment) {
        await saveAppointmentPrescription({
          id: prescriptionForAppointment.id,
          prescriptionText: prescriptionText,
        }).unwrap();
        toast.success("Prescription saved for appointment!");
      }
      setPrescriptionText("");
      setSelectedConsultation(null);
      setPrescriptionForAppointment(null);
    } catch {
      toast.error("Failed to save prescription");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Doctor Dashboard</h1>
              <p className="mt-1 text-blue-100">Welcome, {doctorDetails?.name || user.email}</p>
            </div>

            <button
              onClick={handleToggleOnline}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                isOnline
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {isOnline ? "🟢 Go Offline" : "Go Online for Video"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard label="Total Appointments" value={summary.totalAppointments} />
            <SummaryCard label="Completed" value={summary.paidAppointments} color="green" />
            <SummaryCard label="Upcoming" value={summary.unpaidAppointments + summary.partialAppointments} color="blue" />
            <SummaryCard label="Total Revenue" value={`৳${summary.totalPaid}`} color="teal" />
          </div>
        )}

        {/* Consultation Queue */}
        {waitingPatients.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              🟢 Waiting Patients
              <span className="text-sm font-normal text-gray-500">({waitingPatients.length})</span>
            </h2>
            <div className="bg-white rounded-2xl border divide-y">
              {waitingPatients.map((patient) => (
                <div key={patient.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{patient.patientName}</div>
                    <div className="text-sm text-gray-500">{patient.patientPhone}</div>
                  </div>
                  <button
                    onClick={() => handleAcceptPatient(patient.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium"
                  >
                    Accept Patient
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointments Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Appointments</h2>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus)}
            className="border rounded-xl px-4 py-2 text-sm"
          >
            <option value="all">All Appointments</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border py-16 text-center text-gray-500">
            No appointments found
          </div>
        ) : (
          <div className="bg-white rounded-2xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-left text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{apt.patientPhone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.appointmentDate}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge status={apt.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setPrescriptionForAppointment(apt)}
                        className="text-sm px-4 py-1.5 border rounded-lg hover:bg-gray-50"
                      >
                        Prescription
                      </button>
                      {apt.paymentStatus !== "paid" && (
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="text-sm px-4 py-1.5 bg-emerald-600 text-white rounded-lg"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AppModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Mark Appointment as Paid"
      >
        <div className="space-y-4">
          <input
            type="number"
            placeholder="Amount paid"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />
          <button
            onClick={handleMarkPaid}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold"
          >
            Confirm Payment
          </button>
        </div>
      </AppModal>

      {/* Prescription Modal */}
      <AppModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => {
          setSelectedConsultation(null);
          setPrescriptionForAppointment(null);
          setPrescriptionText("");
        }}
        title="Write Prescription"
      >
        <div className="space-y-4">
          <textarea
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            rows={6}
            placeholder="Enter prescription details..."
            className="w-full border rounded-xl p-4"
          />
          <button
            onClick={handleSavePrescription}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
          >
            Save Prescription
          </button>
        </div>
      </AppModal>
    </div>
  );
}

function SummaryCard({ label, value, color = "gray" }: { label: string; value: string | number; color?: string }) {
  const colors: Record<string, string> = {
    gray: "bg-white",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    teal: "bg-teal-50 text-teal-700",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-1 opacity-80">{label}</p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    unpaid: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium ${styles[status] || styles.unpaid}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
