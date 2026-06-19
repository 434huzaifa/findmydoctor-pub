import { RRule } from "rrule";

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6

/**
 * Given an rrule string and a chamber open time ("HH:mm"),
 * returns the next appointment Date (UTC) after now in Asia/Dhaka timezone.
 * Returns null if no future occurrence exists.
 */
export function computeNextAppointment(
  rruleStr: string,
  openTime: string,
): Date | null {
  try {
    const rule = RRule.fromString(rruleStr);
    // "now" in Dhaka — shift current UTC epoch by +6h so RRule (which works in UTC)
    // treats local Dhaka time as UTC
    const nowDhaka = new Date(Date.now() + DHAKA_OFFSET_MS);
    const next = rule.after(nowDhaka, false);
    if (!next) return null;

    // Parse openTime to set the hour/minute on the occurrence
    const [hStr, mStr] = openTime.split(":");
    const h = parseInt(hStr ?? "0", 10);
    const m = parseInt(mStr ?? "0", 10);

    // next is already a "Dhaka local" time encoded as UTC — set open-time hours
    const withTime = new Date(next);
    withTime.setUTCHours(h, m, 0, 0);

    // Convert back to real UTC (subtract Dhaka offset)
    return new Date(withTime.getTime() - DHAKA_OFFSET_MS);
  } catch {
    return null;
  }
}
