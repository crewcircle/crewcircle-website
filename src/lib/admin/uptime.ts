/**
 * Uptime check service for the observability hub.
 * Checks configured URLs from UPTIME_URL_* env vars.
 *
 * For production, replace with Uptime Robot API or a cron-based
 * check that writes to a Supabase table. This is the simple in-req version.
 */

export interface UptimeResult {
  url: string;
  label: string;
  status: "up" | "down" | "unknown";
  response_time_ms: number | null;
  status_code: number | null;
  error: string | null;
  checked_at: string;
}

/**
 * Run uptime checks against all configured URLs.
 * Discovers URLs from env vars matching UPTIME_URL_<LABEL>=<url>.
 */
export async function runUptimeChecks(): Promise<UptimeResult[]> {
  const urls = Object.entries(process.env)
    .filter(([key]) => key.startsWith("UPTIME_URL_"))
    .map(([key, url]) => ({
      label: key.replace("UPTIME_URL_", "").toLowerCase().replace(/_/g, " "),
      url: url!,
    }));

  if (urls.length === 0) {
    return [];
  }

  const results = await Promise.all(
    urls.map(async ({ url, label }) => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
          signal: controller.signal,
          // Simple GET — for health endpoints returning JSON, this works
        });
        clearTimeout(timeout);

        return {
          url,
          label,
          status: res.ok ? ("up" as const) : ("down" as const),
          response_time_ms: Date.now() - start,
          status_code: res.status,
          error: null,
          checked_at: new Date().toISOString(),
        };
      } catch (err) {
        return {
          url,
          label,
          status: "down" as const,
          response_time_ms: Date.now() - start,
          status_code: null,
          error: err instanceof Error ? err.message : "Connection failed",
          checked_at: new Date().toISOString(),
        };
      }
    })
  );

  return results;
}
