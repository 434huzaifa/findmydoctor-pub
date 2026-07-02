import { NextResponse } from "next/server";
import { getDataSource } from "@/server/db/data-source";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    // Check database connection
    const ds = await getDataSource();
    await ds.query("SELECT 1");

    const responseTime = Date.now() - start;

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: "connected",
      version: process.env.npm_package_version || "1.0.0",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
