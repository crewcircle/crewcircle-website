import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getSentryAggregate } from "@/lib/admin/sentry";

/**
 * GET /api/admin/observability/sentry
 *
 * Aggregated Sentry issues across all CrewCircle projects.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) {
      return new NextResponse(e.body, { status: e.status, headers: e.headers });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSentryAggregate();
  return NextResponse.json(data);
}
