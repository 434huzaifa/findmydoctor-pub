import { NextRequest } from "next/server";
import { getDataSource, HomeVisitRequest } from "@/server/db/data-source";
import { ok, badRequest } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patientName, phone, address, situationDescription } = body;

    if (!patientName || !phone || !address) {
      return badRequest("patientName, phone, and address are required");
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(HomeVisitRequest);

    const request = repo.create({
      patientName,
      phone,
      address,
      situationDescription: situationDescription || null,
      amount: 5000,
      isPaid: false,
    });

    await repo.save(request);

    return ok(request, 201);
  } catch (e) {
    return handleError(e);
  }
}
