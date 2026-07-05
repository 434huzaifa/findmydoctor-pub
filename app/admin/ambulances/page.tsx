"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useGetTableRowsQuery,
  useDeleteTableRowMutation,
  useUpdateTableRowMutation
} from "@/store/fmdApi";
import { AddAmbulanceForm } from "@/components/admin/AddAmbulanceForm";
import { EditRowModal } from "@/components/admin/EditRowModal";
import { Button } from "@/shared/components/ui/Button";
import { computeHours } from "@/modules/ambulance";

const DISPATCH_STATUS_STYLES: Record<string, string> = {
  dispatched: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function AdminAmbulancesPage() {
  const [tab, setTab] = useState<"fleet" | "bookings">("fleet");
  const [page, setPage] = useState(1);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  const {
    data,
    isLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: "ambulance", page },
    { pollingInterval: 0 }
  );

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useGetTableRowsQuery(
    { table: "ambulance_dispatch", page: bookingsPage },
    { pollingInterval: 0 }
  );

  const [deleteRow] = useDeleteTableRowMutation();
  const [updateRow] = useUpdateTableRowMutation();

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this ambulance?")) return;
    try {
      await deleteRow({ table: "ambulance", id }).unwrap();
      toast.success("Ambulance deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleDispatchStatus(
    dispatchId: number,
    ambulanceId: number,
    status: "completed" | "cancelled"
  ) {
    try {
      await updateRow({
        table: "ambulance_dispatch",
        id: dispatchId,
        data: { status },
      }).unwrap();
      await updateRow({
        table: "ambulance",
        id: ambulanceId,
        data: { isAvailable: true },
      }).unwrap();
      toast.success(`Booking marked as ${status}`);
      refetchBookings();
      refetch();
    } catch {
      toast.error("Failed to update booking");
    }
  }

  const columns = [
    { name: "id", label: "ID" },
    { name: "vehicleNumber", label: "Vehicle No" },
    { name: "driverName", label: "Driver" },
    { name: "driverPhone", label: "Phone" },
    { name: "baseLocation", label: "Location" },
    { name: "isAvailable", label: "Available" },
    { name: "hourlyRate", label: "Hourly Rate" },
    { name: "publicDescription", label: "Public Description" },
    { name: "detailedDescription", label: "Detailed Description" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Ambulances</h1>
          <p className="text-sm text-gray-500">Add, edit, and track your ambulance fleet</p>
        </div>
        {tab === "fleet" && <AddAmbulanceForm onSaved={refetch} />}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("fleet")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            tab === "fleet" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Fleet
        </button>
        <button
          onClick={() => setTab("bookings")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            tab === "bookings" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Bookings
        </button>
      </div>

      {tab === "fleet" ? (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th key={col.name} className="px-6 py-4 font-semibold text-gray-600">
                    {col.label}
                  </th>
                ))}
                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    Loading ambulances...
                  </td>
                </tr>
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    No ambulances found.
                  </td>
                </tr>
              ) : (
                data?.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.name} className="px-6 py-4 text-gray-700">
                        {col.name === "isAvailable" ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row[col.name] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {row[col.name] ? "Ready" : "Busy"}
                          </span>
                        ) : col.name === "hourlyRate" ? (
                          `৳${row[col.name] ?? 0}`
                        ) : col.name === "publicDescription" || col.name === "detailedDescription" ? (
                          <span className="line-clamp-2 max-w-xs block text-xs text-gray-500">
                            {String(row[col.name] ?? "—")}
                          </span>
                        ) : (
                          String(row[col.name] ?? "")
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setEditRow(row)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDelete(row.id as number)} className="text-red-600 hover:underline font-medium">Delete</button>
                        <button onClick={async () => {
                          try {
                            await updateRow({ table: "ambulance", id: row.id as number, data: { isAvailable: !row.isAvailable } }).unwrap();
                            toast.success(row.isAvailable ? "Marked as Busy" : "Marked as Ready");
                            refetch();
                          } catch { toast.error("Update failed"); }
                        }} className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${row.isAvailable ? "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100" : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"}`}>
                          {row.isAvailable ? "Set Busy" : "Set Ready"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            Page {page} of {Math.ceil((data?.total ?? 0) / (data?.limit ?? 10))}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil((data?.total ?? 0) / (data?.limit ?? 10))} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
      ) : (
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Ambulance</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Caller</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Pickup Location</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Start</th>
                <th className="px-6 py-4 font-semibold text-gray-600">End</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Duration</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Cost</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookingsLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookingsData?.rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookingsData?.rows.map((row, i) => {
                  const ambulance = row.ambulance as Record<string, unknown> | undefined;
                  const startTime = row.startTime ? new Date(row.startTime as string) : null;
                  const endTime = row.endTime ? new Date(row.endTime as string) : null;
                  const status = String(row.status ?? "");
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-700">
                        {ambulance ? String(ambulance.vehicleNumber ?? "") : `#${row.ambulanceId}`}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <div>{String(row.callerName ?? "")}</div>
                        <div className="text-xs text-gray-500">{String(row.callerPhone ?? "")}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{String(row.pickupLocation ?? "")}</td>
                      <td className="px-6 py-4 text-gray-700 text-xs">
                        {startTime ? startTime.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-xs">
                        {endTime ? endTime.toLocaleString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {startTime && endTime ? `${computeHours(startTime, endTime)}h` : "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        ৳{Number(row.totalCost ?? 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full font-medium capitalize ${DISPATCH_STATUS_STYLES[status] || "bg-gray-100 text-gray-700"}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {status === "dispatched" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDispatchStatus(row.id as number, row.ambulanceId as number, "completed")}
                              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => handleDispatchStatus(row.id as number, row.ambulanceId as number, "cancelled")}
                              className="text-xs px-3 py-1.5 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <span className="text-sm text-gray-500">
            Page {bookingsPage} of {Math.ceil((bookingsData?.total ?? 0) / (bookingsData?.limit ?? 10))}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={bookingsPage <= 1} onClick={() => setBookingsPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={bookingsPage >= Math.ceil((bookingsData?.total ?? 0) / (bookingsData?.limit ?? 10))} onClick={() => setBookingsPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
      )}

      {editRow && (
        <EditRowModal
          isOpen
          onClose={() => setEditRow(null)}
          table="ambulance"
          row={editRow}
          columns={[
            { name: "vehicleNumber", label: "Vehicle No" },
            { name: "driverName", label: "Driver Name" },
            { name: "driverPhone", label: "Driver Phone" },
            { name: "baseLocation", label: "Base Location" },
            { name: "isAvailable", label: "Is Available" },
            { name: "hourlyRate", label: "Hourly Rate", type: "numeric" },
            { name: "publicDescription", label: "Public Description", nullable: true },
            { name: "detailedDescription", label: "Detailed Description", nullable: true },
          ]}
          onSaved={() => {
            setEditRow(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
