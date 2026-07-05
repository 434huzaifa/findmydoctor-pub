import { NextRequest } from "next/server";
import { getAuthUser, requireRole } from "@/server/lib/auth-guard";
import { ok } from "@/server/lib/response";
import { getDataSource, Appointment, Review, Doctor } from "@/server/db/data-source";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    requireRole(user, "admin");

    const ds = await getDataSource();

    const [
      appointmentsPerDay,
      statusBreakdown,
      ratingTrend,
      topDoctorsByVolume,
      topDoctorsByRating,
      bottomDoctorsByRating,
    ] = await Promise.all([
      ds
        .getRepository(Appointment)
        .createQueryBuilder("a")
        .select("DATE_TRUNC('day', a.createdAt)", "day")
        .addSelect("COUNT(*)", "count")
        .where("a.createdAt >= NOW() - INTERVAL '30 days'")
        .groupBy("DATE_TRUNC('day', a.createdAt)")
        .orderBy("day", "ASC")
        .getRawMany<{ day: Date; count: string }>(),

      ds
        .getRepository(Appointment)
        .createQueryBuilder("a")
        .select("a.status", "status")
        .addSelect("COUNT(*)", "count")
        .where("a.createdAt >= NOW() - INTERVAL '30 days'")
        .groupBy("a.status")
        .getRawMany<{ status: string; count: string }>(),

      ds
        .getRepository(Review)
        .createQueryBuilder("r")
        .select("DATE_TRUNC('week', r.createdAt)", "week")
        .addSelect("AVG(r.rating)", "avgRating")
        .addSelect("COUNT(*)", "count")
        .where("r.createdAt >= NOW() - INTERVAL '12 weeks'")
        .groupBy("DATE_TRUNC('week', r.createdAt)")
        .orderBy("week", "ASC")
        .getRawMany<{ week: Date; avgRating: string; count: string }>(),

      ds
        .getRepository(Appointment)
        .createQueryBuilder("a")
        .leftJoin(Doctor, "d", "d.id = a.doctorId")
        .select("a.doctorId", "doctorId")
        .addSelect("d.name", "doctorName")
        .addSelect("COUNT(*) FILTER (WHERE a.status = 'completed')", "completedCount")
        .groupBy("a.doctorId")
        .addGroupBy("d.name")
        .orderBy("\"completedCount\"", "DESC")
        .limit(5)
        .getRawMany<{ doctorId: number; doctorName: string; completedCount: string }>(),

      ds
        .getRepository(Doctor)
        .createQueryBuilder("d")
        .select(["d.id AS \"doctorId\"", "d.name AS \"doctorName\"", "d.rating AS rating"])
        .orderBy("d.rating", "DESC")
        .limit(5)
        .getRawMany<{ doctorId: number; doctorName: string; rating: string }>(),

      ds
        .getRepository(Doctor)
        .createQueryBuilder("d")
        .select(["d.id AS \"doctorId\"", "d.name AS \"doctorName\"", "d.rating AS rating"])
        .orderBy("d.rating", "ASC")
        .limit(5)
        .getRawMany<{ doctorId: number; doctorName: string; rating: string }>(),
    ]);

    const totalRecent = statusBreakdown.reduce((sum, s) => sum + parseInt(s.count, 10), 0);
    const noShowCount = statusBreakdown.find((s) => s.status === "no_show")?.count ?? "0";
    const noShowRate = totalRecent > 0 ? (parseInt(noShowCount, 10) / totalRecent) * 100 : 0;

    return ok({
      appointmentsPerDay: appointmentsPerDay.map((r) => ({
        day: r.day,
        count: parseInt(r.count, 10),
      })),
      statusBreakdown: statusBreakdown.map((r) => ({
        status: r.status,
        count: parseInt(r.count, 10),
      })),
      noShowRate: Math.round(noShowRate * 10) / 10,
      ratingTrend: ratingTrend.map((r) => ({
        week: r.week,
        avgRating: Math.round(parseFloat(r.avgRating) * 10) / 10,
        count: parseInt(r.count, 10),
      })),
      topDoctorsByVolume: topDoctorsByVolume.map((r) => ({
        doctorId: r.doctorId,
        doctorName: r.doctorName,
        completedCount: parseInt(r.completedCount, 10),
      })),
      topDoctorsByRating: topDoctorsByRating.map((r) => ({
        doctorId: r.doctorId,
        doctorName: r.doctorName,
        rating: parseFloat(r.rating),
      })),
      bottomDoctorsByRating: bottomDoctorsByRating.map((r) => ({
        doctorId: r.doctorId,
        doctorName: r.doctorName,
        rating: parseFloat(r.rating),
      })),
    });
  } catch (e) {
    return handleError(e);
  }
}
