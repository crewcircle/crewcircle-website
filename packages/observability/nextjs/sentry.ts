export async function initSentry(dsn?: string, environment?: string) {
    const resolvedDsn = dsn || process.env.SENTRY_DSN
    if (!resolvedDsn) {
        return
    }

    const Sentry = await import("@sentry/nextjs")
    Sentry.init({
        dsn: resolvedDsn,
        environment: environment || process.env.NEXT_PUBLIC_APP_ENV || "production",
        tracesSampleRate: 0.1,
    })
}
