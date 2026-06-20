import { NextRequest } from "next/server";
import { getDataSource, Ambulance } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { isAvailable } = body;

    const ds = await getDataSource();
    const ambulanceRepo = ds.getRepository(Ambulance);

    const ambulance = await ambulanceRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!ambulance) {
      return notFound("Ambulance not found");
    }

    ambulance.isAvailable =
      typeof isAvailable === "boolean" ? isAvailable : !ambulance.isAvailable;

    await ambulanceRepo.save(ambulance);

    return ok(ambulance);
  } catch (e) {
    return handleError(e);
  }
}
