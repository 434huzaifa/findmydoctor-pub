"use client";
import { useEffect, useState } from "react";
import { RRule, Weekday } from "rrule";

type Frequency = "daily" | "weekly" | "monthly";

const WEEKDAYS: { label: string; rruleDay: Weekday }[] = [
  { label: "Mon", rruleDay: RRule.MO },
  { label: "Tue", rruleDay: RRule.TU },
  { label: "Wed", rruleDay: RRule.WE },
  { label: "Thu", rruleDay: RRule.TH },
  { label: "Fri", rruleDay: RRule.FR },
  { label: "Sat", rruleDay: RRule.SA },
  { label: "Sun", rruleDay: RRule.SU },
];

interface RRuleBuilderProps {
  value?: string;
  openTime?: string;
  closeTime?: string;
  onChange: (rrule: string, openTime: string, closeTime: string) => void;
}

function parseInitialRRule(value?: string) {
  const initial = {
    freq: "weekly" as Frequency,
    time: "10:00",
    selectedDays: [0] as number[],
    monthDay: 1,
  };

  if (!value) return initial;

  try {
    const rule = RRule.fromString(value);
    const opts = rule.origOptions;

    if (opts.freq === RRule.DAILY) initial.freq = "daily";
    else if (opts.freq === RRule.WEEKLY) initial.freq = "weekly";
    else if (opts.freq === RRule.MONTHLY) initial.freq = "monthly";

    if (opts.byhour != null && opts.byminute != null) {
      const h = Array.isArray(opts.byhour) ? opts.byhour[0] : opts.byhour;
      const m = Array.isArray(opts.byminute) ? opts.byminute[0] : opts.byminute;
      initial.time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    if (opts.byweekday) {
      const days = Array.isArray(opts.byweekday)
        ? opts.byweekday
        : [opts.byweekday];
      initial.selectedDays = days
        .map((d) =>
          typeof d === "number" ? d : (d as { weekday: number }).weekday,
        )
        .filter((n) => n !== undefined);
    }

    if (opts.bymonthday) {
      const day = Array.isArray(opts.bymonthday)
        ? opts.bymonthday[0]
        : opts.bymonthday;
      if (day) initial.monthDay = day;
    }
  } catch {
    // ignore parse errors
  }

  return initial;
}

export function RRuleBuilder({
  value,
  openTime: initOpen = "09:00",
  closeTime: initClose = "17:00",
  onChange,
}: RRuleBuilderProps) {
  const initial = parseInitialRRule(value);
  const [freq, setFreq] = useState<Frequency>(initial.freq);
  const [time, setTime] = useState(initial.time);
  const [openTime, setOpenTime] = useState(initOpen);
  const [closeTime, setCloseTime] = useState(initClose);
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initial.selectedDays,
  ); // 0=MO
  const [monthDay, setMonthDay] = useState(initial.monthDay);

  // Build and emit rrule string whenever deps change
  useEffect(() => {
    const [hStr, mStr] = time.split(":");
    const h = parseInt(hStr ?? "0", 10);
    const m = parseInt(mStr ?? "0", 10);

    let rule: RRule;
    if (freq === "daily") {
      rule = new RRule({
        freq: RRule.DAILY,
        byhour: h,
        byminute: m,
        bysecond: 0,
      });
    } else if (freq === "weekly") {
      const days = selectedDays.map((i) => WEEKDAYS[i]!.rruleDay);
      rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday: days.length ? days : [RRule.MO],
        byhour: h,
        byminute: m,
        bysecond: 0,
      });
    } else {
      rule = new RRule({
        freq: RRule.MONTHLY,
        bymonthday: monthDay,
        byhour: h,
        byminute: m,
        bysecond: 0,
      });
    }

    onChange(rule.toString(), openTime, closeTime);
  }, [freq, time, selectedDays, monthDay, openTime, closeTime, onChange]);

  const toggleDay = (idx: number) => {
    setSelectedDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx],
    );
  };

  const inputCls =
    "rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-sm focus:border-[color:var(--teal)] focus:outline-none";

  return (
    <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--teal-pale)] p-4">
      <p className="text-xs font-semibold text-[color:var(--teal)] uppercase tracking-wide">
        Appointment Schedule
      </p>

      {/* Frequency */}
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly"] as Frequency[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFreq(f)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
              freq === f
                ? "bg-[color:var(--teal)] text-white"
                : "border border-[color:var(--border)] bg-white text-[color:var(--text)]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Appointment start time */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-[color:var(--text-muted)] w-28">
          Appointment time
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Weekly day picker */}
      {freq === "weekly" && (
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((d, i) => (
            <button
              key={d.label}
              type="button"
              onClick={() => toggleDay(i)}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                selectedDays.includes(i)
                  ? "bg-[color:var(--teal)] text-white"
                  : "border border-[color:var(--border)] bg-white text-[color:var(--text)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      {/* Monthly day picker */}
      {freq === "monthly" && (
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[color:var(--text-muted)] w-28">
            Day of month
          </label>
          <input
            type="number"
            min={1}
            max={28}
            value={monthDay}
            onChange={(e) => setMonthDay(Number(e.target.value))}
            className={`${inputCls} w-20`}
          />
        </div>
      )}

      {/* Chamber open/close times */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[color:var(--text-muted)] w-28">
            Chamber opens
          </label>
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[color:var(--text-muted)] w-28">
            Chamber closes
          </label>
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
}
