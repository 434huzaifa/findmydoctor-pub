"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminDashboardQuery,
  useGetSchemaQuery,
  useGetTableRowsQuery,
  useDeleteTableRowMutation,
  useUpdateTableRowMutation,
} from "@/store/fmdApi";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AddSpecialtyForm } from "@/components/admin/AddSpecialtyForm";
import { AddDoctorForm } from "@/components/admin/AddDoctorForm";
import { AddMedicineForm } from "@/components/admin/AddMedicineForm";
import { AddAmbulanceForm } from "@/components/admin/AddAmbulanceForm";
import { EditRowModal } from "@/components/admin/EditRowModal";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthorized = user?.role === "admin";

  const {
    data: dashboard,
    refetch: refetchDashboard,
  } = useGetAdminDashboardQuery(undefined, { skip: !isAuthorized });

  const {
    data: schema,
    refetch: refetchSchema,
  } = useGetSchemaQuery(undefined, { skip: !isAuthorized });

  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const {
    data: tableData,
    isLoading: isTableLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: activeTable ?? "", page },
    { skip: !isAuthorized || !activeTable }
  );

  const [deleteRow] = useDeleteTableRowMutation();
  const [updateRow] = useUpdateTableRowMutation();
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isAuthorized) router.replace("/login");
  }, [isAuthorized, router]);

  if (!isAuthorized) return null;

  const activeColumns =
    schema?.find((s) => s.key === activeTable)?.columns ?? [];

  async function handleDelete(table: string, id: number) {
    if (!confirm("Are you sure you want to delete this row?")) return;
    try {
      await deleteRow({ table, id }).unwrap();
      toast.success("Row deleted");
      refetch();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[color:var(--text)] mb-6">
        Admin Panel
      </h1>

      {/* Dashboard Stats */}
      {dashboard && <DashboardStats data={dashboard} />}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <AddSpecialtyForm
          onSaved={() => {
            refetchSchema();
            if (activeTable === "specialty") refetch();
          }}
        />
        <AddDoctorForm
          onSaved={() => {
            refetchDashboard();
            refetchSchema();
            if (activeTable === "doctor") refetch();
          }}
        />
        <AddMedicineForm
          onSaved={() => {
            refetchSchema();
            if (activeTable === "medicine") refetch();
          }}
        />
        <AddAmbulanceForm
          onSaved={() => {
            refetchDashboard();
            refetchSchema();
            if (activeTable === "ambulance") refetch();
          }}
        />
        <Link href="/admin/messages">
          <Button variant="outline">✉️ Support Messages</Button>
        </Link>
      </div>

      {/* Table Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {schema?.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTable(t.key);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTable === t.key
                ? "bg-[color:var(--teal)] text-white"
                : "bg-white border border-[color:var(--border)] text-[color:var(--text-muted)] hover:border-[color:var(--teal)]"
            }`}
          >
            {t.key}
          </button>
        ))}
      </div>

      {/* Table Data */}
      {activeTable && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[color:var(--border)] flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[color:var(--text)]">
              {activeTable} Table
            </h2>
            {tableData && (
              <span className="text-sm text-[color:var(--text-muted)]">
                {tableData.total} total rows
              </span>
            )}
          </div>

          {isTableLoading ? (
            <div className="p-12 text-center text-[color:var(--text-muted)]">
              Loading...
            </div>
          ) : tableData ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-[color:var(--border)]">
                    <tr>
                      {schema
                        ?.find((s) => s.key === activeTable)
                        ?.columns.map((c) => (
                          <th
                            key={c.name}
                            className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--text-muted)] uppercase whitespace-nowrap"
                          >
                            {c.name}
                          </th>
                        ))}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-[color:var(--text-muted)] uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--border)]">
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {schema
                          ?.find((s) => s.key === activeTable)
                          ?.columns.map((c) => (
                            <td
                              key={c.name}
                              className="px-4 py-3 text-[color:var(--text)] max-w-[200px] truncate"
                            >
                              {String(row[c.name] ?? "")}
                            </td>
                          ))}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setEditRow(row)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(activeTable!, row.id as number)} className="text-xs text-red-600 hover:underline">Delete</button>
                            
                            {/* Quick status actions for orders */}
                            {activeTable === "medicine_order" && row.status !== "delivered" && row.status !== "cancelled" && (
                              <>
                                <button onClick={async () => {
                                  try {
                                    const next: Record<string, string> = { pending: "confirmed", confirmed: "processing", processing: "delivered" };
                                    const nextStatus = next[row.status as string] || "delivered";
                                    await updateRow({ table: "medicine_order", id: row.id as number, data: { status: nextStatus } }).unwrap();
                                    toast.success(`Order → ${nextStatus}`);
                                    refetch();
                                  } catch { toast.error("Failed"); }
                                }} className="text-xs text-green-600 hover:underline">
                                  → {({ pending: "Confirm", confirmed: "Process", processing: "Deliver" } as Record<string, string>)[row.status as string] || "Next"}
                                </button>
                                <button onClick={async () => {
                                  try {
                                    await updateRow({ table: "medicine_order", id: row.id as number, data: { status: "cancelled" } }).unwrap();
                                    toast.success("Order cancelled");
                                    refetch();
                                  } catch { toast.error("Failed"); }
                                }} className="text-xs text-orange-600 hover:underline">Cancel</button>
                              </>
                            )}

                            {/* Quick toggle for ambulance availability */}
                            {activeTable === "ambulance" && (
                              <button onClick={async () => {
                                try {
                                  await updateRow({ table: "ambulance", id: row.id as number, data: { isAvailable: !row.isAvailable } }).unwrap();
                                  toast.success(row.isAvailable ? "Marked busy" : "Marked available");
                                  refetch();
                                } catch { toast.error("Failed"); }
                              }} className={`text-xs hover:underline ${row.isAvailable ? "text-orange-600" : "text-green-600"}`}>
                                {row.isAvailable ? "→ Busy" : "→ Available"}
                              </button>
                            )}

                            {/* Quick dispatch status */}
                            {activeTable === "ambulance_dispatch" && row.status === "dispatched" && (
                              <button onClick={async () => {
                                try {
                                  await updateRow({ table: "ambulance_dispatch", id: row.id as number, data: { status: "completed" } }).unwrap();
                                  toast.success("Dispatch completed");
                                  refetch();
                                } catch { toast.error("Failed"); }
                              }} className="text-xs text-green-600 hover:underline">→ Complete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 border-t border-[color:var(--border)] flex items-center justify-between">
                <span className="text-sm text-[color:var(--text-muted)]">
                  Page {page} of{" "}
                  {Math.ceil(tableData.total / tableData.limit)}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={
                      page >= Math.ceil(tableData.total / tableData.limit)
                    }
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Edit Row Modal */}
      {editRow && activeTable && (
        <EditRowModal
          isOpen
          onClose={() => setEditRow(null)}
          table={activeTable}
          row={editRow}
          columns={activeColumns}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
}
