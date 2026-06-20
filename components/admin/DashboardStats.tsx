"use client";

import { StatCard } from "../common/StatCard";
import type { AdminDashboard } from "@/types/domain";

interface Props {
  data: AdminDashboard;
}

export function DashboardStats({ data }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
      <StatCard label="Doctors" value={data.doctors} />
      <StatCard label="Appointments" value={data.appointments} />
      <StatCard label="Revenue" value={`৳${(data.revenue ?? 0).toLocaleString()}`} />
      <StatCard label="Medicines" value={data.medicines ?? 0} />
      <StatCard label="🚑 Ambulances" value={data.ambulances ?? 0} />
      <StatCard label="🏠 Home Visits" value={data.homeVisits ?? 0} />
      <StatCard label="🎥 Consultations" value={data.consultations ?? 0} />
    </div>
  );
}
