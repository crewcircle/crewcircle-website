import { NextResponse } from "next/server";
import { readRegistry } from "@/lib/admin/registry";

/**
 * GET /api/admin/health
 *
 * Lightweight health check for the admin API.
 * Verifies registry.json is accessible and returns project count.
 * No auth required — used by uptime checks.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const registry = readRegistry();
    return NextResponse.json({
      status: "ok",
      project_count: registry.projects.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
