
import { AppError } from "@/server/lib/app-error";
import { err } from "@/server/lib/response";
import { NextResponse } from "next/server";
export function handleError(e: unknown): NextResponse {
  if (e instanceof AppError) return err(e.message, e.code, e.statusCode, e.details);
  console.error(e);
  return err("Something went wrong", "INTERNAL_ERROR", 500);
}