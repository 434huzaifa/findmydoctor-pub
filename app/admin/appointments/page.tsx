"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAdminAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
} from "@/store/fmdApi";
import { Button } from "@/shared/components/ui/Button";
import type { AppointmentStatus } from "@/types/domain";

const STATUS_OPTIONS: { value: AppointmentStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
  no_show: "bg-red-100 text-red-700",
};

export default function AdminAppointmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useGetAdminAppointmentsQuery({
    page,
    limit,
    status,
  });
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateAppointmentStatusMutation();

  const appointments = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function handleUpdateStatus(
    id: number,
    doctorId: number,
    newStatus: AppointmentStatus
  ) {
    try {
      await updateStatus({ id, status: newStatus, doctorId }).unwrap();
      toast.success(`Marked as ${newStatus.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update appointment status");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">
            Manage appointment status across all doctors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AppointmentStatus | "");
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing..." : "🔄 Refresh"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Patient</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Doctor</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Payment</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{apt.patientName}</div>
                      <div className="text-xs text-gray-500">{apt.patientPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.doctor?.name ?? `#${apt.doctorId}`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {apt.appointmentDate} · {apt.slot}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full font-medium capitalize ${
                          STATUS_STYLES[apt.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {apt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {apt.paymentStatus}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {apt.status === "confirmed" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(apt.id, apt.doctorId, "completed")
                            }
                            disabled={isUpdating}
                            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                          >
                            Mark Completed
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(apt.id, apt.doctorId, "no_show")
                            }
                            disabled={isUpdating}
                            className="text-sm px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                          >
                            No-show
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages} ({data?.total ?? 0} total)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
