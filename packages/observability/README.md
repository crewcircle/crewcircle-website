# CrewCircle observability stack

Shared observability code and runbooks for CrewCircle apps. Copy the relevant module into each app repo and wire it up with Doppler secrets.

## Python backends

Copy `packages/observability/python/crewcircle_observability/` into your backend, then install requirements:

```bash
pip install sentry-sdk requests
```

Bootstrap at app startup:

```python
from crewcircle_observability import configure_logging, init_sentry, get_logger

configure_logging(json_format=True)
init_sentry()
logger = get_logger(__name__)
```

Add a health endpoint:

```python
from crewcircle_observability import health_router

app.get("/health")(health_router("taxflowai"))
```

Emit metrics:

```python
from crewcircle_observability import MetricsEmitter

metrics = MetricsEmitter("taxflowai")
metrics.increment("requests", tags={"route": "/api/ask"})
```

## LLM cost tracking

Copy `packages/observability/llm_cost/tracker.py` into your backend, or import it from the shared package:

```python
from llm_cost.tracker import LLMCostTracker

tracker = LLMCostTracker()
tracker.record("claude-sonnet-4-20250514", 1200, 450, app="taxflowai", feature="ato-answer")
print(tracker.summary())
```

## Uptime monitoring

Copy `packages/observability/uptime/check.py`. Set targets via environment variables:

```bash
UPTIME_URL_1="https://taxflow.crewcircle.com.au/health,https://localmate.crewcircle.com.au/health"
python check.py
```

It prints JSON results and returns a non-zero exit code if any target is down. Wire it into cron or a serverless function with an alert webhook.

## Next.js / Vercel frontends

Copy `packages/observability/nextjs/sentry.ts` and call `initSentry()` in your instrumentation file. Install the dependency in the target app:

```bash
npm install @sentry/nextjs
```

Vercel Analytics and Speed Insights are already used on `crewcircle-website`.

## Required secrets (Doppler)

- `SENTRY_DSN` — per-app Sentry project
- `APP_ENV` — production/staging/dev
- `APP_VERSION` — git sha or release tag
- `UPTIME_URL_*` — comma-separated health URLs for uptime checks
- Alerting webhook URL (Slack/PagerDuty) for uptime alerts

## Deployment

1. Provision per-app Sentry projects via Pulumi (`packages/infra/`).
2. Inject `SENTRY_DSN` and `APP_ENV` from Doppler into each deployment.
3. Run uptime checks from a scheduled job (GitHub Actions, cron, or Vercel Cron).
4. Ship LLM cost summaries to the same metrics store or a shared dashboard.
