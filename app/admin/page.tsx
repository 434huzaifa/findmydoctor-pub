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
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here is what's happening with your platform.</p>
      </header>

      {/* Dashboard Stats */}
      {dashboard && <DashboardStats data={dashboard} />}

      {/* Management Hub */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Management Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ambulance Management Card */}
          <Link href="/admin/ambulances" className="group p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all hover:border-blue-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-xl text-2xl">🚑</div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition">Ambulance Fleet</h3>
                <p className="text-sm text-gray-500">Manage vehicles, drivers, and availability</p>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-between py-2">
              Manage Fleet <span>→</span>
            </Button>
          </Link>

          {/* Placeholder for future management cards */}
          <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-gray-200 text-gray-500 rounded-xl text-2xl mb-2">🩺</div>
            <h3 className="font-medium text-gray-600">Doctor Management</h3>
            <p className="text-xs text-gray-400">Coming Soon</p>
          </div>

          <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-gray-200 text-gray-500 rounded-xl text-2xl mb-2">💊</div>
            <h3 className="font-medium text-gray-600">Medicine Inventory</h3>
            <p className="text-xs text-gray-400">Coming Soon</p>
          </div>
        </div>
      </section>

      {/* Advanced System Tables */}
      <section className="mt-12 pt-12 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">System Table Viewer</h2>
            <p className="text-sm text-gray-500">Advanced raw data access and quick edits</p>
          </div>
          <Link href="/admin/messages">
            <Button variant="outline">✉️ Support Messages</Button>
          </Link>
        </div>

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
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-blue-500"
              }`}
            >
              {t.key}
            </button>
          ))}
        </div>

        {activeTable && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTable} Table
              </h2>
              {tableData && (
                <span className="text-sm text-gray-500">
                  {tableData.total} total rows
                </span>
              )}
            </div>

            {isTableLoading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : tableData ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {schema
                          ?.find((s) => s.key === activeTable)
                          ?.columns.map((c) => (
                            <th key={c.name} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                              {c.name}
                            </th>
                          ))}
                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tableData.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          {schema
                            ?.find((s) => s.key === activeTable)
                            ?.columns.map((c) => (
                              <td key={c.name} className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                                {String(row[c.name] ?? "")}
                              </td>
                            ))}
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => {}} className="text-xs text-blue-600 hover:underline">Edit</button>
                              <button onClick={() => handleDelete(activeTable!, row.id as number)} className="text-xs text-red-600 hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Page {page} of {Math.ceil(tableData.total / tableData.limit)}</span>
                  <div className="flex gap-2">
                    <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)} variant="outline" size="sm">Prev</Button>
                    <Button disabled={page >= Math.ceil(tableData.total / tableData.limit)} onClick={() => setPage(p => p + 1)} variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
