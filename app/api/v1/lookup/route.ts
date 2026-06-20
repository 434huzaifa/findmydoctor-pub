import { NextRequest } from "next/server";
import {
  getDataSource,
  Appointment,
  MedicineOrder,
  AmbulanceDispatch,
  HomeVisitRequest,
} from "@/server/db/data-source";
import { ok, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/lookup?phone=...&type=appointments|orders|ambulance|homevisit&page=1&limit=5
 *
 * Lookup all user activity by phone number with separate pagination per type.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone")?.trim();
    const type = searchParams.get("type") || "appointments";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "5")));
    const skip = (page - 1) * limit;

    if (!phone) {
      return badRequest("phone is required");
    }

    const ds = await getDataSource();

    if (type === "appointments") {
      const repo = ds.getRepository(Appointment);
      const query = repo
        .createQueryBuilder("a")
        .leftJoinAndSelect("a.doctor", "d")
        .leftJoinAndSelect("d.specialty", "s")
        .where("a.patientPhone = :phone", { phone })
        .orderBy("a.createdAt", "DESC")
        .skip(skip)
        .take(limit);

      const [items, total] = await query.getManyAndCount();
      return ok({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    if (type === "orders") {
      const repo = ds.getRepository(MedicineOrder);
      const query = repo
        .createQueryBuilder("o")
        .leftJoinAndSelect("o.medicine", "m")
        .where("o.guestPhone = :phone", { phone })
        .orderBy("o.createdAt", "DESC")
        .skip(skip)
        .take(limit);

      const [items, total] = await query.getManyAndCount();
      return ok({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    if (type === "ambulance") {
      const repo = ds.getRepository(AmbulanceDispatch);
      const query = repo
        .createQueryBuilder("d")
        .leftJoinAndSelect("d.ambulance", "a")
        .where("d.callerPhone = :phone", { phone })
        .orderBy("d.createdAt", "DESC")
        .skip(skip)
        .take(limit);

      const [items, total] = await query.getManyAndCount();
      return ok({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    if (type === "homevisit") {
      const repo = ds.getRepository(HomeVisitRequest);
      const query = repo
        .createQueryBuilder("h")
        .where("h.phone = :phone", { phone })
        .orderBy("h.createdAt", "DESC")
        .skip(skip)
        .take(limit);

      const [items, total] = await query.getManyAndCount();
      return ok({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    return badRequest("Invalid type. Use: appointments, orders, ambulance, homevisit");
  } catch (e) {
    return handleError(e);
  }
}
