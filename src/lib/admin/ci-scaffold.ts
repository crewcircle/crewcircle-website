/**
 * After a successful provision, scaffold the standard CI workflow
 * into the new project's GitHub repo.
 *
 * Fetches the canonical CI template from the crewcircle/.github repo
 * and writes it to the new repo via GitHub API.
 */

const TEMPLATE_URL =
  "https://raw.githubusercontent.com/crewcircle/.github/main/workflow-templates/ci.yml";

export async function scaffoldCIWorkflow(
  projectId: string,
  org: string = "crewcircle"
): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set — cannot scaffold CI workflow");
    return false;
  }

  try {
    // Fetch the canonical CI template
    const templateRes = await fetch(TEMPLATE_URL);
    if (!templateRes.ok) {
      console.warn(`Failed to fetch CI template: ${templateRes.status}`);
      return false;
    }
    const template = await templateRes.text();

    // Put file into the new repo
    const res = await fetch(
      `https://api.github.com/repos/${org}/${projectId}/contents/.github/workflows/ci.yml`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: "ci: add standard CrewCircle CI workflow",
          content: Buffer.from(template).toString("base64"),
        }),
      }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.warn(
        `Failed to scaffold CI for ${projectId}: ${res.status} — ${(body as Record<string, unknown>).message ?? "unknown"}`
      );
      return false;
    }

    console.log(`✓ CI workflow scaffolded for ${projectId}`);
    return true;
  } catch (err) {
    console.error("CI scaffold error:", err);
    return false;
  }
}

/**
 * Seed the project_github_meta table with initial data after provision.
 * Allows the project dashboard to show GitHub stats without an immediate
 * API call on the next page load.
 */
export async function seedGitHubMeta(projectId: string): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return;

  try {
    const res = await fetch(
      `https://api.github.com/repos/crewcircle/${projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!res.ok) return;

    const repo = await res.json();

    // Store via service client in provision.ts or directly here
    // This would require importing createServiceClient and inserting
    // into project_github_meta table — implemented in Phase 1 Task 6 migration
    console.log(
      `GitHub meta available for ${projectId}: ★${repo.stargazers_count}`
    );
  } catch {
    // Best-effort — dashboard falls back to live GitHub API
  }
}
