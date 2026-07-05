import { RRule, Weekday } from "rrule";

// ─── Weekly Availability ────────────────────────────────────────────────────

export const WEEKDAY_OPTIONS: { value: number; label: string; short: string }[] = [
  { value: 0, label: "Monday", short: "Mon" },
  { value: 1, label: "Tuesday", short: "Tue" },
  { value: 2, label: "Wednesday", short: "Wed" },
  { value: 3, label: "Thursday", short: "Thu" },
  { value: 4, label: "Friday", short: "Fri" },
  { value: 5, label: "Saturday", short: "Sat" },
  { value: 6, label: "Sunday", short: "Sun" },
];

const RRULE_WEEKDAYS: Weekday[] = [
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
  RRule.SU,
];

export interface WeeklyAvailability {
  daysOfWeek: number[]; // 0=Monday ... 6=Sunday, matching WEEKDAY_OPTIONS
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export function toRRuleString(availability: WeeklyAvailability): string | null {
  if (availability.daysOfWeek.length === 0) return null;
  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday: availability.daysOfWeek.map((d) => RRULE_WEEKDAYS[d]),
  });
  return rule.toString();
}

export function fromRRuleString(rruleStr: string | null): WeeklyAvailability | null {
  if (!rruleStr) return null;
  try {
    const rule = RRule.fromString(rruleStr);
    const daysOfWeek = (rule.options.byweekday ?? []) as number[];
    return {
      daysOfWeek,
      startTime: "",
      endTime: "",
    };
  } catch {
    return null;
  }
}

export function previewOccurrences(
  rruleStr: string,
  openTime: string,
  count = 5
): Date[] {
  try {
    const rule = RRule.fromString(rruleStr);
    const [hStr, mStr] = openTime.split(":");
    const h = parseInt(hStr ?? "0", 10);
    const m = parseInt(mStr ?? "0", 10);

    const occurrences = rule.all((_, i) => i < count);
    return occurrences.map((d) => {
      const withTime = new Date(d);
      withTime.setHours(h, m, 0, 0);
      return withTime;
    });
  } catch {
    return [];
  }
}
