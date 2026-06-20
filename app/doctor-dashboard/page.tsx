"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDoctorDashboardQuery,
  useMarkAppointmentPaidMutation,
  useGetDoctorQueueQuery,
  useAcceptPatientMutation,
  useCompleteConsultationMutation,
  useSavePrescriptionMutation,
  useSaveAppointmentPrescriptionMutation,
  useToggleDoctorOnlineMutation,
  useGetDoctorQuery,
} from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";
import type { ApiAppointment, VirtualConsultation } from "@/types/domain";

export default function DoctorDashboardPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedAppointment, setSelectedAppointment] =
    useState<ApiAppointment | null>(null);
  const [payAmount, setPayAmount] = useState("");

  // Prescription state — works for both consultations AND appointments
  const [selectedConsultation, setSelectedConsultation] =
    useState<VirtualConsultation | null>(null);
  const [prescriptionForAppointment, setPrescriptionForAppointment] =
    useState<ApiAppointment | null>(null);
  const [prescriptionText, setPrescriptionText] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "doctor" && user.role !== "admin") {
      router.push("/");
    }
  }, [user, router]);

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

  const [markPaid, { isLoading: isMarking }] = useMarkAppointmentPaidMutation();
  const [acceptPatient, { isLoading: isAccepting }] = useAcceptPatientMutation();
  const [savePrescription, { isLoading: isSavingConsultation }] = useSavePrescriptionMutation();
  const [saveAppointmentPrescription, { isLoading: isSavingAppointment }] = useSaveAppointmentPrescriptionMutation();
  const [completeConsultation, { isLoading: isCompleting }] = useCompleteConsultationMutation();
  const [toggleOnline, { isLoading: isTogglingOnline }] = useToggleDoctorOnlineMutation();

  if (!user) return null;

  const isOnline = doctorDetails?.isOnlineForVideo ?? false;
  const summary = dashboard?.summary;
  const appointments = dashboard?.items || [];
  const waitingPatients = consultationQueue?.filter((c) => c.status === "waiting") || [];
  const activeConsultation = consultationQueue?.find((c) => c.status === "active");
  const isSavingPrescription = isSavingConsultation || isSavingAppointment;
  const isPrescriptionModalOpen = !!selectedConsultation || !!prescriptionForAppointment;

  const handleMarkPaid = async () => {
    if (!selectedAppointment || !payAmount) return;
    try {
      await markPaid({ id: selectedAppointment.id, paidAmount: Number(payAmount), doctorId }).unwrap();
      toast.success("Payment recorded");
      setSelectedAppointment(null);
      setPayAmount("");
    } catch { toast.error("Failed to record payment"); }
  };

  const handleAcceptPatient = async (id: number) => {
    try {
      await acceptPatient(id).unwrap();
      toast.success("Patient accepted! Jitsi room created.");
      refetchQueue();
    } catch { toast.error("Failed to accept patient"); }
  };

  const handleToggleOnline = async () => {
    if (!doctorId) return;
    try {
      await toggleOnline({ doctorId, isOnlineForVideo: !isOnline }).unwrap();
      toast.success(isOnline ? "You are now offline" : "You are now online for video calls!");
    } catch { toast.error("Failed to toggle status"); }
  };

  const handleSavePrescription = async () => {
    if (!prescriptionText.trim()) return;

    try {
      if (selectedConsultation) {
        // Save to virtual consultation
        await savePrescription({ id: selectedConsultation.id, prescriptionText: prescriptionText.trim() }).unwrap();
        toast.success("Prescription saved for video consultation!");
        refetchQueue();
      } else if (prescriptionForAppointment) {
        // Save to regular appointment
        await saveAppointmentPrescription({ id: prescriptionForAppointment.id, prescriptionText: prescriptionText.trim() }).unwrap();
        toast.success("Prescription saved for appointment!");
      }
      setSelectedConsultation(null);
      setPrescriptionForAppointment(null);
      setPrescriptionText("");
    } catch { toast.error("Failed to save prescription"); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Doctor Dashboard</h1>
              <p className="mt-1 text-blue-100">Welcome, {doctorDetails?.name || user.email}</p>
            </div>

            {/* Toggle Online — button text changes based on status */}
            {doctorId && (
              <button
                onClick={handleToggleOnline}
                disabled={isTogglingOnline}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition ${
                  isOnline
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isTogglingOnline ? (
                  <span>Updating...</span>
                ) : isOnline ? (
                  <>
                    <span className="animate-pulse">🟢</span>
                    Go Offline
                  </>
                ) : (
                  <>
                    <span>⚪</span>
                    Go Online for Video Calls
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Online Status Banner */}
        {isOnline && (
          <div className="mb-6 rounded-2xl border-2 border-green-400 bg-green-50 p-4 flex items-center gap-3">
            <span className="text-3xl animate-pulse">🟢</span>
            <div>
              <p className="font-semibold text-green-800">You are ONLINE for video consultations</p>
              <p className="text-sm text-green-600">Patients can see you and join your queue. {waitingPatients.length} patient(s) waiting.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <DashStatCard label="Total" value={summary.totalAppointments} color="blue" />
            <DashStatCard label="Paid" value={summary.paidAppointments} color="green" />
            <DashStatCard label="Partial" value={summary.partialAppointments} color="yellow" />
            <DashStatCard label="Unpaid" value={summary.unpaidAppointments} color="red" />
            <DashStatCard label="Expected" value={`৳${summary.expectedAmount}`} color="purple" />
            <DashStatCard label="Collected" value={`৳${summary.totalPaid}`} color="emerald" />
          </div>
        )}

        {/* Video Queue */}
        {isOnline && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <span className="animate-pulse">🎥</span> Video Consultation Queue
            </h2>

            {/* Active Consultation */}
            {activeConsultation && (
              <div className="mb-4 rounded-xl bg-white border-2 border-green-400 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">ACTIVE</span>
                    <p className="mt-1 font-semibold text-gray-900">{activeConsultation.patientName}</p>
                    <p className="text-sm text-gray-500">{activeConsultation.patientPhone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={activeConsultation.videoLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                      📹 Open Jitsi
                    </a>
                    <button
                      onClick={() => {
                        setSelectedConsultation(activeConsultation);
                        setPrescriptionText(activeConsultation.prescriptionText || "");
                      }}
                      className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                    >
                      📝 Prescription
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await completeConsultation(activeConsultation.id).unwrap();
                          toast.success("Consultation completed.");
                          refetchQueue();
                        } catch { toast.error("Failed"); }
                      }}
                      disabled={isCompleting}
                      className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {isCompleting ? "Ending..." : "✅ End Call"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Waiting Patients */}
            {waitingPatients.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-green-700">{waitingPatients.length} patient(s) waiting</p>
                {waitingPatients.map((patient, idx) => (
                  <div key={patient.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white p-4 border border-green-200">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-green-600">#{idx + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{patient.patientName}</p>
                        <p className="text-sm text-gray-500">{patient.patientPhone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAcceptPatient(patient.id)}
                      disabled={isAccepting || !!activeConsultation}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isAccepting ? "Accepting..." : "Accept Patient"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-700 text-sm">No patients waiting. You&apos;re online and ready.</p>
            )}
          </div>
        )}

        {/* Date Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">From:</label>
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">To:</label>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm" />
          </div>
          {(dateRange.from || dateRange.to) && (
            <button onClick={() => setDateRange({ from: "", to: "" })} className="text-sm text-red-600 hover:underline">Clear</button>
          )}
        </div>

        {/* Appointments Table */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Slot</th>
                    <th className="px-4 py-3">Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Prescription</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{apt.patientName}</p>
                        <p className="text-xs text-gray-500">{apt.patientPhone}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{apt.appointmentDate}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{apt.slot}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium">৳{apt.fee}</p>
                        {apt.paidAmount != null && <p className="text-xs text-green-600">Paid: ৳{apt.paidAmount}</p>}
                        {apt.amountDue > 0 && <p className="text-xs text-red-600">Due: ৳{apt.amountDue}</p>}
                      </td>
                      <td className="px-4 py-4">
                        <PaymentBadge status={apt.paymentStatus} />
                      </td>
                      <td className="px-4 py-4">
                        {apt.prescriptionText ? (
                          <span className="text-xs text-green-600 font-medium">✅ Given</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPrescriptionForAppointment(apt);
                              setPrescriptionText(apt.prescriptionText || "");
                            }}
                            className="text-xs text-purple-600 hover:underline"
                          >
                            📝 Rx
                          </button>
                          {apt.paymentStatus !== "paid" && (
                            <button
                              onClick={() => { setSelectedAppointment(apt); setPayAmount(String(apt.amountDue || apt.fee)); }}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              💰 Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Mark Paid Modal */}
      <AppModal
        isOpen={!!selectedAppointment}
        onClose={() => { setSelectedAppointment(null); setPayAmount(""); }}
        title="Record Payment"
        footer={
          <>
            <button onClick={() => { setSelectedAppointment(null); setPayAmount(""); }}
              className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={handleMarkPaid} disabled={isMarking || !payAmount}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {isMarking ? "Saving..." : "Confirm Payment"}
            </button>
          </>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="font-medium">{selectedAppointment.patientName}</p>
              <p className="text-sm text-gray-500">Fee: ৳{selectedAppointment.fee} | Due: ৳{selectedAppointment.amountDue}</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount Received</label>
              <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                className="w-full rounded-lg border px-3 py-2" placeholder="Enter amount" />
            </div>
          </div>
        )}
      </AppModal>

      {/* Unified Prescription Modal — works for both consultations and appointments */}
      <AppModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => { setSelectedConsultation(null); setPrescriptionForAppointment(null); setPrescriptionText(""); }}
        title="Write Prescription"
        size="lg"
        footer={
          <>
            <button onClick={() => { setSelectedConsultation(null); setPrescriptionForAppointment(null); setPrescriptionText(""); }}
              className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
            <button onClick={handleSavePrescription} disabled={isSavingPrescription || !prescriptionText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {isSavingPrescription ? "Saving..." : "Save Prescription"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-purple-50 p-4">
            {selectedConsultation && (
              <>
                <p className="text-xs font-medium text-purple-600">Video Consultation</p>
                <p className="font-semibold text-purple-900">{selectedConsultation.patientName}</p>
                <p className="text-sm text-purple-700">{selectedConsultation.patientPhone}</p>
              </>
            )}
            {prescriptionForAppointment && (
              <>
                <p className="text-xs font-medium text-purple-600">Appointment #{prescriptionForAppointment.id}</p>
                <p className="font-semibold text-purple-900">{prescriptionForAppointment.patientName}</p>
                <p className="text-sm text-purple-700">{prescriptionForAppointment.patientPhone} · {prescriptionForAppointment.appointmentDate}</p>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Prescription</label>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
              placeholder={"Write prescription here...\n\nExample:\n1. Paracetamol 500mg - 1 tablet 3 times daily after meals\n2. Rest for 3 days\n3. Drink plenty of fluids\n4. Follow up in 1 week"}
            />
          </div>
        </div>
      </AppModal>
    </div>
  );
}

function DashStatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    red: "bg-red-50 border-red-200 text-red-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
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
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.unpaid}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
