import { NextResponse } from "next/server";

export type OkEnvelope<T> = { success: true; data: T };
export type ErrEnvelope = { success: false; code: string; message: string; details?: unknown };

export function ok<T>(data: T, status = 200): NextResponse<OkEnvelope<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function notFound(message = "Not found"): NextResponse<ErrEnvelope> {
  return NextResponse.json({ success: false, code: "not_found", message }, { status: 404 });
}

export function err(
  message: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse<ErrEnvelope> {
  return NextResponse.json({ success: false, code, message, details: details ?? null }, { status });
}
