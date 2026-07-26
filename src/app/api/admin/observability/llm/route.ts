import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getLLMCostSummary } from "@/lib/admin/costs";

/**
 * GET /api/admin/observability/llm?days=30
 *
 * LLM usage trends: daily cost + calls by model and app.
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

  const data = await getLLMCostSummary(days);
  return NextResponse.json(data);
}
