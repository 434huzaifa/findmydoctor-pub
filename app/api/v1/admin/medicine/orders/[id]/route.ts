import { NextRequest } from "next/server";
import { getDataSource, MedicineOrder } from "@/server/db/data-source";
import { ok, notFound } from "@/server/lib/response";
import { handleError } from "@/server/lib/handle-error";
import z from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    // get single order by id
}

export async function DELETE(req: NextRequest) {
    // delete order by id
}