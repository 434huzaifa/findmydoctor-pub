import { NextRequest } from "next/server";
import { getDataSource, Doctor } from "@/server/db/data-source";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import type { DoctorAvailability, DoctorSort } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 36;
const SORT_OPTIONS = new Set<DoctorSort>([
  "",
  "fee_asc",
  "fee_desc",
  "booked_desc",
  "booked_asc",
]);
const AVAILABILITY_OPTIONS = new Set<DoctorAvailability | "">([
  "",
  "full",
  "limited",
  "available",
]);

function getAvailability(doc: Doctor) {
  const remaining = doc.totalSeats - doc.usedSeats;
  const pct = doc.totalSeats ? remaining / doc.totalSeats : 0;
  if (remaining <= 0) return "full";
  if (pct <= 0.4) return "limited";
  return "available";
}

function getPositiveInt(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = getPositiveInt(searchParams.get("page"), 1);
    const requestedLimit = getPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const search = (searchParams.get("search") ?? "").trim().toLowerCase();
    const specialtyIdRaw = searchParams.get("specialty");
    const specialtyId = specialtyIdRaw ? Number(specialtyIdRaw) : null;
    const city = (searchParams.get("city") ?? "").trim().toLowerCase();
    const availabilityRaw = searchParams.get("availability") ?? "";
    const sortByRaw = searchParams.get("sortBy") ?? "";
    const availability = AVAILABILITY_OPTIONS.has(availabilityRaw as DoctorAvailability | "")
      ? (availabilityRaw as DoctorAvailability | "")
      : "";
    const sortBy = SORT_OPTIONS.has(sortByRaw as DoctorSort)
      ? (sortByRaw as DoctorSort)
      : "";

    const ds = await getDataSource();
    const doctors = await ds.getRepository(Doctor).find({
      relations: { specialty: true },
      order: { createdAt: "ASC" },
    });

    const filtered = doctors.filter((d) => {
      if (
        search &&
        !`${d.name} ${d.hospital} ${d.specialty?.name ?? ""}`
          .toLowerCase()
          .includes(search)
      )
        return false;
      if (specialtyId && d.specialtyId !== specialtyId) return false;
      if (city && d.city.trim().toLowerCase() !== city) return false;
      if (availability && getAvailability(d) !== availability) return false;
      return true;
    });

    // Sort
    if (sortBy === "fee_asc") {
      filtered.sort((a, b) => a.fee - b.fee);
    } else if (sortBy === "fee_desc") {
      filtered.sort((a, b) => b.fee - a.fee);
    } else if (sortBy === "booked_desc") {
      filtered.sort((a, b) => b.usedSeats - a.usedSeats);
    } else if (sortBy === "booked_asc") {
      filtered.sort((a, b) => a.usedSeats - b.usedSeats);
    }

    const total = filtered.length;
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
    const start = (currentPage - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return ok({
      items,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (e) {
    return handleError(e);
  }
}
