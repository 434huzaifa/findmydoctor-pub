
import dayjs from "dayjs";
export function formatDateOnly(d: string) { return dayjs(d).format("D MMM YYYY"); }
export function todayIsoLocal() { return dayjs().format("YYYY-MM-DD"); }
