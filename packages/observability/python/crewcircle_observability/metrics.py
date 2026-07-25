import os
from datetime import datetime, timezone


class MetricsEmitter:
    def __init__(self, app_name=None):
        self.app_name = app_name or os.getenv("APP_NAME", "unknown")
        self._counts = {}
        self._gauges = {}
        self._latencies = []

    def increment(self, name, tags=None, value=1):
        key = self._key(name, tags)
        self._counts[key] = self._counts.get(key, 0) + value

    def gauge(self, name, value, tags=None):
        key = self._key(name, tags)
        self._gauges[key] = value

    def latency(self, name, seconds, tags=None):
        self._latencies.append(
            {
                "name": name,
                "value": seconds,
                "tags": tags or {},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    def snapshot(self):
        return {
            "app": self.app_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "counters": self._counts,
            "gauges": self._gauges,
            "latencies": self._latencies[-100:],
        }

    def reset(self):
        self._counts.clear()
        self._gauges.clear()
        self._latencies.clear()

    def _key(self, name, tags):
        tag_str = ",".join(f"{k}={v}" for k, v in sorted((tags or {}).items()))
        return f"{name}:{tag_str}" if tag_str else name
