import { NextRequest } from "next/server";
import { getDataSource } from "@/server/db/data-source";
import { Message } from "@/server/db/entities/Message";
import { ok } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const offset = (page - 1) * limit;

    const ds = await getDataSource();
    const repo = ds.getRepository(Message);

    const [items, total] = await Promise.all([
      repo.find({
        order: { createdAt: "DESC" },
        take: limit,
        skip: offset,
      }),
      repo.count(),
    ]);

    return ok({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const ds = await getDataSource();
        const repo = ds.getRepository(Message);
        
        const message = repo.create({
            senderName: body.senderName,
            senderPhone: body.senderPhone,
            message: body.message,
        });
        
        await repo.save(message);
        return ok(message);
    } catch (e) {
        return handleError(e);
    }
}
