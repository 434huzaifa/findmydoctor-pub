"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  useGetTableRowsQuery, 
  useDeleteTableRowMutation, 
  useUpdateTableRowMutation 
} from "@/store/fmdApi";
import { EditRowModal } from "@/components/admin/EditRowModal";
import { Button } from "@/shared/components/ui/Button";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const limit = 15;

  const {
    data,
    isLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: "medicine_order", page, limit },
    { pollingInterval: 0 }
  );

  const [deleteRow] = useDeleteTableRowMutation();
  const [updateRow] = useUpdateTableRowMutation();

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

  async function updateStatus(id: number, currentStatus: string) {
    const statusFlow: Record<string, string> = {
      "pending": "processing",
      "processing": "delivered",
      "delivered": "delivered",
      "cancelled": "cancelled"
    };

    const nextStatus = statusFlow[currentStatus] || "pending";
    if (nextStatus === currentStatus && currentStatus === "delivered") {
        toast.info("Order is already delivered");
        return;
    }

    try {
      await updateRow({ table: "medicine_order", id, data: { status: nextStatus } }).unwrap();
      toast.success(`Order status updated to ${nextStatus}`);
      refetch();
    } catch {
      toast.error("Failed to update status");
    }
  }

  const columns = [
    { name: "id", label: "Order ID" },
    { name: "guestPhone", label: "Phone" },
    { name: "quantity", label: "Qty" },
    { name: "status", label: "Status" },
    { name: "createdAt", label: "Date" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500">Track and update medicine order statuses</p>
        </div>
      </div>

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
                    Loading orders...
                  </td>
                </tr>
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                data?.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.name} className="px-6 py-4 text-gray-700">
                        {col.name === "status" ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row[col.name] === 'pending' ? 'bg-blue-100 text-blue-700' : 
                            row[col.name] === 'processing' ? 'bg-yellow-100 text-yellow-700' : 
                            row[col.name] === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {String(row[col.name] ?? "pending").toUpperCase()}
                          </span>
                        ) : col.name === "createdAt" ? (
                          <span className="text-xs">{new Date(String(row[col.name])).toLocaleString()}</span>
                        ) : (
                          String(row[col.name] ?? "")
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setEditRow(row)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDelete(row.id as number)} className="text-red-600 hover:underline font-medium">Delete</button>
                        <button 
                            onClick={() => updateStatus(row.id as number, String(row.status))} 
                            className="text-xs bg-gray-100 px-2 py-1 rounded border hover:bg-gray-200 transition"
                        >
                            {String(row.status) === 'pending' ? '→ Process' : String(row.status) === 'processing' ? '→ Deliver' : 'Done'}
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
            Page {page} of {Math.ceil((data?.total ?? 0) / limit)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil((data?.total ?? 0) / limit)} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

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
