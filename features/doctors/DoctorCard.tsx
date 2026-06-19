
"use client";
import Link from "next/link";
import type { Doctor } from "@/types/domain";
import { COLORS, getAvailStatus, getColorIndex, getInitials } from "@/lib/doctor";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const color = COLORS[getColorIndex(doctor.id)];
  const avail = getAvailStatus(doctor);
  const availColor = avail === "available" ? "bg-green-100 text-green-700" : avail === "limited" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-serif text-xl font-bold text-white" style={{ backgroundColor: color }}>
          {getInitials(doctor.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate font-serif text-lg font-bold text-[color:var(--text)]">{doctor.name}</h3>
          <p className="text-sm font-medium text-[color:var(--teal)]">{doctor.specialty?.icon || "🩺"} {doctor.specialty?.name}</p>
          <p className="text-xs text-[color:var(--text-muted)]">🏥 {doctor.hospital} · 📍 {doctor.city}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`rounded-full px-3 py-1 font-semibold ${availColor}`}>{avail}</span>
        <span className="font-semibold text-[color:var(--teal)]">৳{doctor.fee.toLocaleString()}</span>
      </div>
      <div className="flex gap-2">
        <Link href={`/doctors/${doctor.id}`} className="flex-1 rounded-xl border border-[color:var(--teal)] py-2 text-center text-xs font-semibold text-[color:var(--teal)] hover:bg-[color:var(--teal-pale)]">
          View Profile
        </Link>
        <Link href={`/booking/${doctor.id}`} className="flex-1 rounded-xl bg-[color:var(--teal)] py-2 text-center text-xs font-semibold text-white hover:bg-[color:var(--teal-light)]">
          Book Now
        </Link>
      </div>
    </div>
  );
}
