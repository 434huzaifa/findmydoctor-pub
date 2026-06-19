"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetDoctorDashboardQuery,
  useMarkAppointmentPaidMutation,
} from "@/store/fmdApi";
import { useAppSelector } from "@/store/hooks";
import { StatCard } from "@/components/common/StatCard";
import { formatDateOnly, todayIsoLocal } from "@/lib/datetime";
import dayjs from "dayjs";

export default function DoctorDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const isAuthorized =
    !!user && (user.role === "doctor" || user.role === "admin");
  const doctorId = user?.doctorId ?? undefined;
  const [from, setFrom] = useState(todayIsoLocal());
  const [to, setTo] = useState(dayjs().add(7, "day").format("YYYY-MM-DD"));
  const { data, isLoading, refetch } = useGetDoctorDashboardQuery(
    {
      doctorId,
      from,
      to,
    },
    { skip: !isAuthorized },
  );
  const [markPaid] = useMarkAppointmentPaidMutation();

  useEffect(() => {
    if (!isAuthorized) router.replace("/login");
  }, [isAuthorized, router]);
  if (!isAuthorized) return null;

  return (
    <div className="px-[5%] py-10">
      <h1 className="font-serif text-3xl font-black text-[color:var(--teal)]">
        Doctor Dashboard
      </h1>
      {data && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <StatCard
            label="Total Appointments"
            value={data.summary.totalAppointments}
          />
          <StatCard label="Unpaid" value={data.summary.unpaidAppointments} />
          <StatCard
            label="Total Paid"
            value={`৳${data.summary.totalPaid.toLocaleString()}`}
          />
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <label className="text-sm font-semibold">
          From{" "}
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="ml-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm"
          />
        </label>
        <label className="text-sm font-semibold">
          To{" "}
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="ml-2 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm"
          />
        </label>
      </div>
      {isLoading ? (
        <p className="mt-8 text-[color:var(--text-muted)]">Loading...</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-[color:var(--text-muted)]">
                <th className="py-3 pr-4">Patient</th>
                <th className="py-3 pr-4">Phone</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Slot</th>
                <th className="py-3 pr-4">Fee</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((a) => (
                <tr
                  key={a.id}
                  className="border-b hover:bg-[color:var(--teal-pale)]"
                >
                  <td className="py-3 pr-4 font-semibold">{a.patientName}</td>
                  <td className="py-3 pr-4 text-[color:var(--text-muted)]">
                    {a.patientPhone}
                  </td>
                  <td className="py-3 pr-4">
                    {formatDateOnly(a.appointmentDate)}
                  </td>
                  <td className="py-3 pr-4">{a.slot}</td>
                  <td className="py-3 pr-4">৳{a.fee.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {a.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3">
                    {a.paymentStatus !== "paid" && (
                      <button
                        onClick={async () => {
                          await markPaid({
                            id: a.id,
                            paidAmount: a.amountDue ?? a.fee,
                            doctorId,
                          });
                          refetch();
                        }}
                        className="rounded-lg bg-[color:var(--teal)] px-3 py-1 text-xs font-semibold text-white hover:bg-[color:var(--teal-light)]"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.items?.length && (
            <p className="py-8 text-center text-[color:var(--text-muted)]">
              No appointments for this period.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
