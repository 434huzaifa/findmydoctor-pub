"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteTableRowMutation,
  useGetAdminMedicineOrdersQuery,
  useUpdateAdminMedicineOrderStatusMutation,
} from "@/store/fmdApi";
import { EditRowModal } from "@/components/admin/EditRowModal";
import type { MedicineOrderStatus } from "@/types/domain";

const STATUS_OPTIONS: { value: MedicineOrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "In Progress" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function getStatusClasses(status: string) {
  switch (status) {
    case "pending":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "confirmed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "processing":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "delivered":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export default function AdminOrdersPage() {
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const { data, isLoading, refetch } = useGetAdminMedicineOrdersQuery();
  const [deleteRow] = useDeleteTableRowMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAdminMedicineOrderStatusMutation();

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteRow({ table: "medicine_order", id }).unwrap();
      toast.success("Order deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleStatusChange(id: number, status: MedicineOrderStatus) {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Order status updated to ${status}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500">Track and update medicine order statuses by section</p>
        </div>
        {/* <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Total Orders</p>
          <p className="mt-1 text-3xl font-black">{data?.total ?? 0}</p>
        </div> */}
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          Loading orders...
        </div>
      ) : !data?.groups?.length ? (
        <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          No orders found.
        </div>
      ) : (
        <div className="space-y-8">
          {data.groups.map((group) => (
            <section key={group.status} className="rounded-3xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{group.label}</h2>
                  <p className="text-sm text-gray-500">{group.count} order{group.count === 1 ? "" : "s"} in this section</p>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusClasses(group.status)}`}>
                  {group.label}
                </span>
              </div>

              {group.rows.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-500">No orders in this status.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-gray-600">Order ID</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Medicine</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Customer</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Qty</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                        <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {group.rows.map((row, index) => {
                        const order = row as Record<string, any>;
                        return (
                          <tr key={order.id ?? index} className="hover:bg-gray-50/80 transition">
                            <td className="px-6 py-4 font-semibold text-gray-900">#{order.id}</td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{order.medicine?.name ?? `Medicine #${order.medicineId}`}</p>
                                <p className="text-xs text-gray-500">{order.medicine?.company ?? "—"}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-800">{order.guestName || "Guest"}</p>
                                <p className="text-xs text-gray-500">{order.guestPhone}</p>
                                <p className="text-xs text-gray-400 line-clamp-1">{order.address}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{order.quantity}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">{new Date(String(order.createdAt)).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${getStatusClasses(String(order.status))}`}>
                                {String(order.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <select
                                  value={String(order.status)}
                                  onChange={(e) => handleStatusChange(Number(order.id), e.target.value as MedicineOrderStatus)}
                                  disabled={isUpdatingStatus}
                                  className="min-w-[150px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                  {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <button onClick={() => setEditRow(order)} className="text-blue-600 hover:underline font-medium">Edit</button>
                                <button onClick={() => handleDelete(Number(order.id))} className="text-red-600 hover:underline font-medium">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {editRow && (
        <EditRowModal
          isOpen
          onClose={() => setEditRow(null)}
          table="medicine_order"
          row={editRow}
          columns={[
            { name: "guestPhone", label: "Phone" },
            { name: "address", label: "Address" },
            { name: "quantity", label: "Quantity" },
            { name: "status", label: "Status" },
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
