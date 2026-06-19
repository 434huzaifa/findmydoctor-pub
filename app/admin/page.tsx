"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetAdminDashboardQuery,
  useGetSchemaQuery,
  useGetTableRowsQuery,
  useDeleteTableRowMutation,
  useUpdateTableRowMutation,
} from "@/store/fmdApi";
import { useAppSelector } from "@/store/hooks";
import { StatCard } from "@/components/common/StatCard";
import { AppModal } from "@/components/common/AppModal";
import { AddDoctorModal } from "@/components/admin/AddDoctorModal";
import { AddSpecialtyForm } from "@/components/admin/AddSpecialtyForm";
import { AddMedicineModal } from "@/components/admin/AddMedicineModal";

function buildInitialRowValues(
  row: Record<string, unknown>,
  columns: { name: string; type: string; nullable: boolean }[],
) {
  const init: Record<string, string> = {};
  for (const col of columns) init[col.name] = String(row[col.name] ?? "");
  return init;
}

// ─── Generic Edit Modal ─────────────────────────────────────────────────────
function EditRowModal({
  open,
  onClose,
  table,
  row,
  columns,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  table: string;
  row: Record<string, unknown>;
  columns: { name: string; type: string; nullable: boolean }[];
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialRowValues(row, columns),
  );
  const [updateRow, { isLoading }] = useUpdateTableRowMutation();

  const editableCols = columns.filter(
    (c) => c.name !== "id" && c.name !== "createdAt" && c.name !== "updatedAt",
  );

  async function handleSave() {
    try {
      const data: Record<string, unknown> = {};
      for (const col of editableCols) {
        const raw = values[col.name] ?? "";
        if (["int4", "integer", "int"].includes(col.type)) {
          data[col.name] = raw === "" ? null : Number(raw);
        } else if (["float8", "decimal", "numeric"].includes(col.type)) {
          data[col.name] = raw === "" ? null : parseFloat(raw);
        } else if (["bool", "boolean"].includes(col.type)) {
          data[col.name] = raw === "true";
        } else {
          data[col.name] = raw === "" && col.nullable ? null : raw;
        }
      }
      await updateRow({ table, id: String(row.id), data }).unwrap();
      toast.success("Row updated");
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error((e as { error?: string })?.error ?? "Update failed");
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={`Edit ${table} row`}
      footer={
        <>
          <button
            onClick={onClose}
            className="rounded-lg border border-[color:var(--border)] px-4 py-1.5 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
        {editableCols.map((col) => (
          <div key={col.name} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[color:var(--text-muted)]">
              {col.name}
            </label>
            <input
              value={values[col.name] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [col.name]: e.target.value }))
              }
              className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none"
            />
          </div>
        ))}
      </div>
    </AppModal>
  );
}

// ─── Add Specialty ──────────────────────────────────────────────────────────




export default function AdminPage() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const isAuthorized = !!user && user.role === "admin";

  const { data: dashboard, refetch: refetchDashboard } =
    useGetAdminDashboardQuery(undefined, {
      skip: !isAuthorized,
    });
  const { data: schema, refetch: refetchSchema } = useGetSchemaQuery(
    undefined,
    {
      skip: !isAuthorized,
    },
  );
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const {
    data: tableData,
    isLoading: isTableLoading,
    refetch,
  } = useGetTableRowsQuery(
    { table: activeTable ?? "", page },
    { skip: !isAuthorized || !activeTable },
  );
  const [deleteRow] = useDeleteTableRowMutation();
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isAuthorized) router.replace("/login");
  }, [isAuthorized, router]);
  if (!isAuthorized) return null;

  const activeColumns =
    schema?.find((s) => s.key === activeTable)?.columns ?? [];

  return (
    <div className="px-[5%] py-10">
      <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
        Admin Panel
      </h1>

      {dashboard && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <StatCard label="Total Doctors" value={dashboard.doctors} />
          <StatCard label="Appointments" value={dashboard.appointments} />
          <StatCard
            label="Revenue"
            value={`৳${dashboard.revenue?.toLocaleString() ?? 0}`}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <AddSpecialtyForm
          onSaved={() => {
            refetchSchema();
            if (activeTable === "specialty") refetch();
          }}
        />
        <AddDoctorModal
          onSaved={() => {
            refetchDashboard();
            refetchSchema();
            if (activeTable === "doctor") refetch();
          }}
        />
        <AddMedicineModal
          onSaved={() => {
            refetchSchema();
            if (activeTable === "medicine") refetch();
          }}
        />
      </div>

      {/* Table selector */}
      <div className="mt-6 flex gap-3 flex-wrap">
        {schema?.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setActiveTable(t.key);
              setPage(1);
            }}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${activeTable === t.key
              ? "bg-[color:var(--teal)] text-white"
              : "border border-[color:var(--border)] bg-white text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]"
              }`}
          >
            {t.tableName}
          </button>
        ))}
      </div>

      {activeTable && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[color:var(--teal)] capitalize">
              {activeTable} Table
            </h2>
            {tableData && (
              <p className="text-sm text-[color:var(--text-muted)]">
                {tableData.total} total rows
              </p>
            )}
          </div>
          {isTableLoading ? (
            <p className="mt-4 text-[color:var(--text-muted)]">Loading...</p>
          ) : (
            tableData && (
              <div className="mt-4 overflow-x-auto rounded-xl border border-[color:var(--border)]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-[color:var(--teal-pale)]">
                      {schema
                        ?.find((s) => s.key === activeTable)
                        ?.columns.map((c) => (
                          <th
                            key={c.name}
                            className="min-w-[120px] whitespace-nowrap px-4 py-2.5 text-left font-semibold text-[color:var(--teal)]"
                          >
                            {c.name}
                          </th>
                        ))}
                      <th className="min-w-[120px] px-4 py-2.5 text-center font-semibold text-[color:var(--teal)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, i) => (
                      <tr key={i} className="border-b hover:bg-gray-50">
                        {schema
                          ?.find((s) => s.key === activeTable)
                          ?.columns.map((c) => (
                            <td
                              key={c.name}
                              className="min-w-[120px] max-w-[220px] truncate whitespace-nowrap px-4 py-2.5 text-[color:var(--text)]"
                            >
                              {String(row[c.name] ?? "")}
                            </td>
                          ))}
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditRow(row)}
                              className="rounded px-2 py-1 text-xs font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (
                                  confirm(
                                    "Delete this row? This cannot be undone.",
                                  )
                                ) {
                                  try {
                                    await deleteRow({
                                      table: activeTable,
                                      id: String(row.id),
                                    }).unwrap();
                                    toast.success("Row deleted");
                                    refetch();
                                  } catch (e: unknown) {
                                    toast.error(
                                      (e as { error?: string })?.error ??
                                      "Delete failed",
                                    );
                                  }
                                }
                              }}
                              className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1 text-xs disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-[color:var(--text-muted)]">
                    Page {page} of{" "}
                    {Math.ceil(tableData.total / tableData.limit)}
                  </span>
                  <button
                    disabled={page * tableData.limit >= tableData.total}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-[color:var(--border)] px-3 py-1 text-xs disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* Generic Edit Modal */}
      {editRow && activeTable && (
        <EditRowModal
          key={String(editRow.id ?? "")}
          open={!!editRow}
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
