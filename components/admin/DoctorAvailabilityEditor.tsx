"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUpdateAdminDoctorMutation } from "@/store/fmdApi";
import { AppModal } from "@/components/common/AppModal";
import {
  WEEKDAY_OPTIONS,
  toRRuleString,
  fromRRuleString,
  previewOccurrences,
} from "@/modules/availability";
import type { Doctor } from "@/types/domain";

interface Props {
  doctor: Doctor;
  onClose: () => void;
  onSaved: () => void;
}

export function DoctorAvailabilityEditor({ doctor, onClose, onSaved }: Props) {
  const parsed = useMemo(() => fromRRuleString(doctor.rrule), [doctor.rrule]);

  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(parsed?.daysOfWeek ?? []);
  const [openTime, setOpenTime] = useState(doctor.chamberOpenTime ?? "09:00");
  const [closeTime, setCloseTime] = useState(doctor.chamberCloseTime ?? "17:00");

  const [updateDoctor, { isLoading }] = useUpdateAdminDoctorMutation();

  const rrule = toRRuleString({ daysOfWeek, startTime: openTime, endTime: closeTime });
  const preview = rrule ? previewOccurrences(rrule, openTime, 5) : [];

  function toggleDay(day: number) {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSave() {
    if (daysOfWeek.length === 0) {
      toast.error("Select at least one day.");
      return;
    }
    try {
      await updateDoctor({
        id: doctor.id,
        data: {
          rrule,
          chamberOpenTime: openTime,
          chamberCloseTime: closeTime,
        },
      }).unwrap();
      toast.success("Availability updated");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to update availability");
    }
  }

  const inputCls =
    "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none";

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title={`Edit Availability — ${doctor.name}`}
      size="lg"
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
            className="rounded-lg bg-[color:var(--teal)] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[color:var(--teal-light)] disabled:opacity-50"
          >
            {isLoading ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-[color:var(--text)]">Days of the week</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEEKDAY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDay(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  daysOfWeek.includes(opt.value)
                    ? "border-[color:var(--teal)] bg-[color:var(--teal)] text-white"
                    : "border-[color:var(--border)] text-[color:var(--text-muted)]"
                }`}
              >
                {opt.short}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[color:var(--text)]">Chamber Open Time</label>
            <input
              type="time"
              value={openTime}
              onChange={(e) => setOpenTime(e.target.value)}
              className={`${inputCls} w-full mt-1`}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[color:var(--text)]">Chamber Close Time</label>
            <input
              type="time"
              value={closeTime}
              onChange={(e) => setCloseTime(e.target.value)}
              className={`${inputCls} w-full mt-1`}
            />
          </div>
        </div>

        <div className="rounded-xl bg-[color:var(--teal-pale)] p-4">
          <p className="text-xs font-semibold text-[color:var(--text-muted)] mb-2">
            Next {preview.length || 0} occurrences
          </p>
          {preview.length === 0 ? (
            <p className="text-sm text-[color:var(--text-muted)]">Select at least one day to preview.</p>
          ) : (
            <ul className="space-y-1 text-sm text-[color:var(--teal)]">
              {preview.map((d, i) => (
                <li key={i}>{d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at {openTime}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppModal>
  );
}
