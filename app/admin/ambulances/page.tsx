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

export default function AdminAmbulancesPage() {
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  const {
    data,
    isLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: "ambulance", page },
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

  const columns = [
    { name: "id", label: "ID" },
    { name: "vehicleNumber", label: "Vehicle No" },
    { name: "driverName", label: "Driver" },
    { name: "driverPhone", label: "Phone" },
    { name: "baseLocation", label: "Location" },
    { name: "isAvailable", label: "Available" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Ambulances</h1>
          <p className="text-sm text-gray-500">Add, edit, and track your ambulance fleet</p>
        </div>
        <AddAmbulanceForm onSaved={refetch} />
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
