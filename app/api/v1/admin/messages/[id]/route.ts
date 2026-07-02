import { NextRequest } from "next/server";
import { getDataSource } from "@/server/db/data-source";
import { Message } from "@/server/db/entities/Message";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId);
    const { status } = await req.json();

    const ds = await getDataSource();
    const repo = ds.getRepository(Message);

    const message = await repo.findOneBy({ id });
    if (!message) {
      return new Response("Message not found", { status: 404 });
    }

    message.status = status;
    await repo.save(message);

    return ok(message);
  } catch (e) {
    return handleError(e);
  }
}
