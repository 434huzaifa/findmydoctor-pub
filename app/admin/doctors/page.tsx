"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useGetAdminDoctorsQuery,
  useDeleteAdminDoctorMutation,
  useUpdateAdminDoctorMutation
} from "@/store/fmdApi";
import { AddDoctorForm } from "@/components/admin/AddDoctorForm";
import { EditRowModal } from "@/components/admin/EditRowModal";

export default function AdminDoctorsPage() {
  console.log("AdminDoctorsPage rendered");
  const [editDoctor, setEditDoctor] = useState<Record<string, unknown> | null>(null);


  const {
    data: doctors,
    isLoading,
    refetch
  } = useGetAdminDoctorsQuery();

  const [deleteDoctor] = useDeleteAdminDoctorMutation();

  async function handleDelete(id: number | undefined | null) {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      if (id === undefined) throw new Error("Doctor ID is undefined");
      if (typeof id !== "number") throw new Error("Doctor ID must be a number");
      await deleteDoctor(id).unwrap();
      toast.success("Doctor deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const columns = [
    { name: "id", label: "ID" },
    { name: "name", label: "Name" },
    { name: "specialtyId", label: "Specialty" },
    { name: "hospital", label: "Hospital" },
    { name: "city", label: "City" },
    { name: "fee", label: "Fee" },
    { name: "exp", label: "Exp" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-sm text-gray-500">Add, edit, and organize healthcare professionals</p>
        </div>
        <AddDoctorForm onSaved={refetch} />
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
                    Loading doctors...
                  </td>
                </tr>
              ) : doctors?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors?.map((doc: Record<string, any>) => (
                  <tr key={doc.id || null} className="hover:bg-gray-50 transition">
                    {columns.map((col) => (
                      <td key={col.name} className="px-6 py-4 text-gray-700">
                        {col.name === "specialtyId" ? (
                          <span className="font-medium text-blue-600">{doc.specialty?.name ?? doc.specialtyId}</span>
                        ) : String(doc[col.name] ?? "")}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button onClick={() => setEditDoctor(doc)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDelete(doc.id || null)} className="text-red-600 hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editDoctor && (
        <EditRowModal
          isOpen
          onClose={() => setEditDoctor(null)}
          table="doctor"
          row={editDoctor}
          columns={[
            { name: "name", label: "Name" },
            { name: "hospital", label: "Hospital" },
            { name: "city", label: "City" },
            { name: "fee", label: "Fee" },
            { name: "advanceFee", label: "Advance Fee" },
            { name: "totalSeats", label: "Total Seats" },
            { name: "exp", label: "Experience" },
            { name: "degrees", label: "Degrees" },
            { name: "chamberAddress", label: "Address" },
            { name: "roomNumber", label: "Room Number" },
          ]}
          onSaved={() => {
            setEditDoctor(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
