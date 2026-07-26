import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getCostDashboard } from "@/lib/admin/costs";

/**
 * GET /api/admin/costs
 *
 * Aggregated cost data for the cost dashboard.
 * Query params:
 *   ?days=30 — period for LLM cost aggregation (default 30)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) {
      return new NextResponse(e.body, { status: e.status, headers: e.headers });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") ?? "30", 10);

  const data = await getCostDashboard(days);
  return NextResponse.json(data);
}
