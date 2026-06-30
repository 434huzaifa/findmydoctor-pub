"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  useGetTableRowsQuery, 
  useDeleteTableRowMutation, 
  useUpdateTableRowMutation 
} from "@/store/fmdApi";
import { AddMedicineForm } from "@/components/admin/AddMedicineForm";
import { EditRowModal } from "@/components/admin/EditRowModal";
import { Button } from "@/shared/components/ui/Button";

export default function AdminMedicinesPage() {
  console.log("AdminMedicinesPage rendered");
  const [page, setPage] = useState(1);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const limit = 15;

  const {
    data,
    isLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: "medicine", page, limit },
    { pollingInterval: 0 }
  );

  const [deleteRow] = useDeleteTableRowMutation();
  const [updateRow] = useUpdateTableRowMutation();

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await deleteRow({ table: "medicine", id }).unwrap();
      toast.success("Medicine deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const columns = [
    { name: "id", label: "ID" },
    { name: "name", label: "Name" },
    { name: "company", label: "Company" },
    { name: "class", label: "Class" },
    { name: "price", label: "Price" },
    { name: "stock", label: "Stock" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Medicines</h1>
          <p className="text-sm text-gray-500">Maintain your pharmaceutical inventory and pricing</p>
        </div>
        <AddMedicineForm onSaved={refetch} />
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
                    Loading medicines...
                  </td>
                </tr>
              ) : data?.rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    No medicines found.
                  </td>
                </tr>
              ) : (
                data?.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.name} className="px-6 py-4 text-gray-700">
                        {col.name === "price" ? `৳${row[col.name]}` : String(row[col.name] ?? "")}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setEditRow(row)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDelete(row.id as number)} className="text-red-600 hover:underline font-medium">Delete</button>
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
          table="medicine"
          row={editRow}
          columns={[
            { name: "name", label: "Name" },
            { name: "description", label: "Description" },
            { name: "company", label: "Company" },
            { name: "class", label: "Class" },
            { name: "price", label: "Price" },
            { name: "stock", label: "Stock" },
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
