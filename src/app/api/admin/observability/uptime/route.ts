import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { runUptimeChecks } from "@/lib/admin/uptime";

/**
 * GET /api/admin/observability/uptime
 *
 * Runs uptime checks against all configured UPTIME_URL_* endpoints.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runUptimeChecks();
  return NextResponse.json({ results });
}
