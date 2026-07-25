import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { readRegistry } from "@/lib/admin/registry";
import { getRepo } from "@/lib/admin/github";

/**
 * GET /api/admin/projects
 *
 * Returns all registered projects enriched with GitHub metadata.
 * Requires admin authentication.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Response) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const registry = readRegistry();

  // Enrich with GitHub metadata (best-effort, fails gracefully)
  const enriched = await Promise.all(
    registry.projects.map(async (project) => {
      const github = await getRepo(project.id);
      return {
        ...project,
        github: github ?? undefined,
      };
    })
  );

  return NextResponse.json({ projects: enriched });
}
