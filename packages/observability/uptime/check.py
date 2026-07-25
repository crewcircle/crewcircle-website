import os
import time
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests


def check_url(url, timeout=10):
    start = time.time()
    try:
        response = requests.get(url, timeout=timeout)
        duration = time.time() - start
        return {
            "url": url,
            "status": "up" if response.status_code < 500 else "degraded",
            "status_code": response.status_code,
            "response_time_ms": round(duration * 1000, 2),
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }
    except requests.RequestException as exc:
        return {
            "url": url,
            "status": "down",
            "status_code": None,
            "response_time_ms": None,
            "error": str(exc),
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }


def check_all(urls, timeout=10):
    return [check_url(url, timeout) for url in urls]


def format_alert(results, alert_threshold_ms=5000):
    down = [r for r in results if r["status"] == "down"]
    slow = [r for r in results if r.get("response_time_ms", 0) > alert_threshold_ms]
    if not down and not slow:
        return None

    lines = ["CrewCircle uptime alert"]
    for r in down + slow:
        lines.append(f"- {r['url']}: {r['status']} ({r.get('status_code') or r.get('error')}, {r.get('response_time_ms')}ms)")
    return "\n".join(lines)


def load_targets_from_env(prefix="UPTIME_URL_"):
    urls = []
    for key, value in os.environ.items():
        if key.startswith(prefix):
            for raw in value.split(","):
                raw = raw.strip()
                if raw:
                    urls.append(raw)
    return urls


def run_check(urls=None, alert_fn=None):
    targets = urls or load_targets_from_env()
    results = check_all(targets)
    message = format_alert(results)
    if message and alert_fn:
        alert_fn(message)
    return results


def _is_valid_url(url):
    parsed = urlparse(url)
    return parsed.scheme in ("http", "https") and parsed.netloc


if __name__ == "__main__":
    targets = load_targets_from_env()
    if not targets:
        print("No UPTIME_URL_* environment variables set.")
        raise SystemExit(0)

    for result in run_check(targets, alert_fn=print):
        print(result)
