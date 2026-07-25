/**
 * Thin wrapper around GitHub REST API for enriching project metadata.
 * Uses GITHUB_TOKEN from environment for authentication.
 */

const GITHUB_API = "https://api.github.com";
const CREWCIRCLE_ORG = process.env.CC_GITHUB_USERNAME ?? "crewcircle";

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  private: boolean;
}

export interface GitHubEnriched {
  stars: number;
  forks: number;
  open_issues: number;
  default_branch: string;
  last_push: string;
  language: string;
  html_url: string;
  archived: boolean;
  private: boolean;
}

/**
 * Fetch repo metadata from GitHub for a given CrewCircle repo name.
 * Uses Next.js fetch with ISR-compatible caching (5 minutes).
 */
export async function getRepo(repoName: string): Promise<GitHubEnriched | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn("GITHUB_TOKEN not set — GitHub enrichment disabled");
    return null;
  }

  const url = `${GITHUB_API}/repos/${CREWCIRCLE_ORG}/${repoName}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 300 }, // 5-minute cache
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.warn(`GitHub API error for ${repoName}: ${res.status}`);
    return null;
  }

  const repo: GitHubRepo = await res.json();
  return {
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    default_branch: repo.default_branch,
    last_push: repo.pushed_at,
    language: repo.language ?? "—",
    html_url: repo.html_url,
    archived: repo.archived,
    private: repo.private,
  };
}
