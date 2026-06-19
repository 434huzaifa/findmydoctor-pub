
import type { Doctor } from "@/types/domain";
export const COLORS = ["#0F6E56","#1D9E75","#04342C","#2D7D9A","#6C4C8B","#B85C38","#3D7EB5","#8B7E44"];
export function getColorIndex(id: string | number | null | undefined) { const key = String(id ?? ""); let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff; return Math.abs(h) % COLORS.length; }
export function getInitials(name: string) { return name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase(); }
export function getAvailStatus(d: Doctor) {
  const remaining = d.totalSeats - d.usedSeats;
  const pct = d.totalSeats ? remaining / d.totalSeats : 0;
  if (remaining <= 0) return "full";
  if (pct <= 0.4) return "limited";
  return "available";
}
