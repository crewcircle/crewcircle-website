/**
 * Sentry issues aggregation for the observability hub.
 * Requires SENTRY_TOKEN + SENTRY_ORG env vars.
 */

const SENTRY_API = "https://sentry.io/api/0";

export interface SentryProjectIssues {
  project_slug: string;
  project_name: string;
  unresolved_count: number;
  total_24h: number;
  total_7d: number;
}

export interface SentryRecentIssue {
  id: string;
  title: string;
  project: string;
  level: string;
  count: number;
  first_seen: string;
  last_seen: string;
  permalink: string;
}

export interface SentryAggregate {
  total_unresolved: number;
  total_24h: number;
  total_7d: number;
  by_project: SentryProjectIssues[];
  recent_issues: SentryRecentIssue[];
}

/**
 * Fetch unresolved issue counts across all Sentry projects in the org.
 * Makes one API call per project to get unresolved count + recent stats.
 */
export async function getSentryAggregate(): Promise<SentryAggregate> {
  const token = process.env.SENTRY_TOKEN;
  const org = process.env.SENTRY_ORG ?? "crewcircle";

  if (!token) {
    return {
      total_unresolved: 0,
      total_24h: 0,
      total_7d: 0,
      by_project: [],
      recent_issues: [],
    };
  }

  try {
    // List all projects in the org
    const projectsRes = await fetch(
      `${SENTRY_API}/organizations/${org}/projects/`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!projectsRes.ok) return emptyAggregate();

    const projects = (await projectsRes.json()) as {
      slug: string;
      name: string;
    }[];

    // Fetch issues for each project
    const projectResults = await Promise.all(
      projects.map(async (p) => {
        const issuesRes = await fetch(
          `${SENTRY_API}/projects/${org}/${p.slug}/issues/?query=is:unresolved&statsPeriod=7d&limit=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!issuesRes.ok)
          return {
            project_slug: p.slug,
            project_name: p.name,
            unresolved_count: 0,
            total_24h: 0,
            total_7d: 0,
          };

        const issues = (await issuesRes.json()) as {
          id: string;
          title: string;
          count: string;
          firstSeen: string;
          lastSeen: string;
          permalink: string;
          level: string;
          stats: { "24h": Array<[number, number]> };
        }[];

        const total24h = issues.reduce(
          (sum, i) =>
            sum + (i.stats?.["24h"]?.[i.stats["24h"].length - 1]?.[1] ?? 0),
          0
        );

        return {
          project_slug: p.slug,
          project_name: p.name,
          unresolved_count: issues.length,
          total_24h: total24h,
          total_7d: issues.reduce((sum, i) => sum + parseInt(i.count, 10), 0),
        };
      })
    );

    // Recent issues across all projects
    const orgIssuesRes = await fetch(
      `${SENTRY_API}/organizations/${org}/issues/?query=is:unresolved&sort=date&limit=10&statsPeriod=7d`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    let recentIssues: SentryRecentIssue[] = [];
    if (orgIssuesRes.ok) {
      const issues = (await orgIssuesRes.json()) as {
        id: string;
        title: string;
        project: { slug: string; name: string };
        level: string;
        count: string;
        firstSeen: string;
        lastSeen: string;
        permalink: string;
      }[];
      recentIssues = issues.map((i) => ({
        id: i.id,
        title: i.title,
        project: i.project?.name ?? i.project?.slug ?? "unknown",
        level: i.level,
        count: parseInt(i.count, 10),
        first_seen: i.firstSeen,
        last_seen: i.lastSeen,
        permalink: i.permalink,
      }));
    }

    return {
      total_unresolved: projectResults.reduce(
        (sum, p) => sum + p.unresolved_count,
        0
      ),
      total_24h: projectResults.reduce((sum, p) => sum + p.total_24h, 0),
      total_7d: projectResults.reduce((sum, p) => sum + p.total_7d, 0),
      by_project: projectResults,
      recent_issues: recentIssues,
    };
  } catch (err) {
    console.error("Sentry aggregation error:", err);
    return emptyAggregate();
  }
}

function emptyAggregate(): SentryAggregate {
  return {
    total_unresolved: 0,
    total_24h: 0,
    total_7d: 0,
    by_project: [],
    recent_issues: [],
  };
}
