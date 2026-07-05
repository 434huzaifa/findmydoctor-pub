"use client";

import { useGetAdminTrendsQuery } from "@/store/fmdApi";

function BarChart({
  data,
  valueKey,
  labelKey,
  barColor = "bg-blue-500",
  formatValue = (v: number) => String(v),
}: {
  data: Record<string, any>[];
  valueKey: string;
  labelKey: string;
  barColor?: string;
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-1 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
          <div
            className={`w-full rounded-t-md ${barColor} transition-all`}
            style={{ height: `${Math.max(2, (d[valueKey] / max) * 100)}%` }}
            title={`${d[labelKey]}: ${formatValue(d[valueKey])}`}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError } = useGetAdminTrendsQuery();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Trends</h1>
        <p className="text-gray-500">Appointment volume, ratings, and doctor performance over time.</p>
      </header>

      {isLoading && <div className="text-gray-500">Loading analytics...</div>}
      {isError && <div className="text-red-600">Failed to load analytics data.</div>}

      {data && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">No-show rate (30 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{data.noShowRate}%</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Appointments (30 days)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.appointmentsPerDay.reduce((s, d) => s + d.count, 0)}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Reviews (12 weeks)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data.ratingTrend.reduce((s, d) => s + d.count, 0)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Appointments per day (last 30 days)</h2>
            {data.appointmentsPerDay.length === 0 ? (
              <p className="text-sm text-gray-500">No appointment data yet.</p>
            ) : (
              <BarChart
                data={data.appointmentsPerDay}
                valueKey="count"
                labelKey="day"
                barColor="bg-blue-500"
              />
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Rating trend (last 12 weeks)</h2>
            {data.ratingTrend.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            ) : (
              <BarChart
                data={data.ratingTrend}
                valueKey="avgRating"
                labelKey="week"
                barColor="bg-yellow-500"
                formatValue={(v) => `${v}★`}
              />
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top doctors by volume</h2>
              {data.topDoctorsByVolume.length === 0 ? (
                <p className="text-sm text-gray-500">No completed appointments yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.topDoctorsByVolume.map((d) => (
                    <li key={d.doctorId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{d.doctorName}</span>
                      <span className="font-semibold text-gray-900">{d.completedCount}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Top rated doctors</h2>
              {data.topDoctorsByRating.length === 0 ? (
                <p className="text-sm text-gray-500">No ratings yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.topDoctorsByRating.map((d) => (
                    <li key={d.doctorId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{d.doctorName}</span>
                      <span className="font-semibold text-gray-900">{d.rating.toFixed(1)}★</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Lowest rated doctors</h2>
              {data.bottomDoctorsByRating.length === 0 ? (
                <p className="text-sm text-gray-500">No ratings yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data.bottomDoctorsByRating.map((d) => (
                    <li key={d.doctorId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{d.doctorName}</span>
                      <span className="font-semibold text-gray-900">{d.rating.toFixed(1)}★</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
