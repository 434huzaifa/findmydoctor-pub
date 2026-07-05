"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  useGetDoctorQuery,
  useUpdateDoctorProfileMutation,
} from "@/store/fmdApi";
import {
  WEEKDAY_OPTIONS,
  toRRuleString,
  fromRRuleString,
  previewOccurrences,
} from "@/modules/availability";

export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const doctorId = user?.doctorId || undefined;

  const { data: doctor, isLoading } = useGetDoctorQuery(doctorId!, {
    skip: !doctorId,
  });
  const [updateProfile, { isLoading: isSaving }] =
    useUpdateDoctorProfileMutation();

  const parsed = useMemo(
    () => fromRRuleString(doctor?.rrule ?? null),
    [doctor?.rrule]
  );

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");

  useEffect(() => {
    if (!doctor) return;
    setDaysOfWeek(parsed?.daysOfWeek ?? []);
    setOpenTime(doctor.chamberOpenTime ?? "09:00");
    setCloseTime(doctor.chamberCloseTime ?? "17:00");
  }, [doctor, parsed]);

  if (!user) {
    router.push("/login");
    return null;
  }

  const rrule = toRRuleString({ daysOfWeek, startTime: openTime, endTime: closeTime });
  const preview = rrule ? previewOccurrences(rrule, openTime, 5) : [];

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {
    if (!doctorId) return;
    if (daysOfWeek.length === 0) {
      toast.error("Select at least one day.");
      return;
    }
    try {
      await updateProfile({
        id: doctorId,
        data: {
          rrule,
          chamberOpenTime: openTime,
          chamberCloseTime: closeTime,
        },
      }).unwrap();
      toast.success("Availability updated");
    } catch {
      toast.error("Failed to update availability");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Weekly Availability</h1>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl border p-6 space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Days of the week
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDay(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      daysOfWeek.includes(opt.value)
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    {opt.short}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Chamber Open Time
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Chamber Close Time
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Next {preview.length || 0} occurrences
              </p>
              {preview.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Select at least one day to preview.
                </p>
              ) : (
                <ul className="space-y-1 text-sm text-teal-700">
                  {preview.map((d, i) => (
                    <li key={i}>
                      {d.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {openTime}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
