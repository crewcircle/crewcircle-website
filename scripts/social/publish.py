#!/usr/bin/env python3
"""Local social media automation for CrewCircle.

Reads a YAML calendar and publishes posts to Substack, LinkedIn, X, and YouTube
without using third-party scheduling tools. Runs on your laptop with cron or launchd.
"""

import argparse
import json
import logging
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

sys.path.insert(0, str(Path(__file__).parent))

from platforms import linkedin, substack, twitter, youtube

PLATFORMS: dict[str, Any] = {
    "substack": substack,
    "linkedin": linkedin,
    "twitter": twitter,
    "youtube": youtube,
}

logger = logging.getLogger("crewcircle.social")


def _resolve_env(value: Any) -> Any:
    if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
        name = value[2:-1]
        return os.environ.get(name, value)
    return value


def _load_yaml(path: Path) -> Any:
    with path.open() as f:
        data = yaml.safe_load(f)
    return data


def _substitute_env(data: Any) -> Any:
    if isinstance(data, dict):
        return {k: _substitute_env(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_substitute_env(v) for v in data]
    return _resolve_env(data)


def _load_doppler_secrets(config: dict[str, Any]) -> None:
    project = config.get("doppler_project")
    config_name = config.get("doppler_config", "prod")
    if not project:
        raise ValueError("doppler_project is required when secrets_source is 'doppler'")

    try:
        result = subprocess.run(
            ["doppler", "secrets", "--json", "-p", project, "-c", config_name],
            capture_output=True,
            text=True,
            check=True,
        )
    except FileNotFoundError as e:
        raise RuntimeError(
            "Doppler CLI not found. Install from https://docs.doppler.com/docs/install-cli "
            "or use secrets_source: env with a .env file."
        ) from e
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Doppler CLI failed: {e.stderr}") from e

    secrets = json.loads(result.stdout)
    for key, meta in secrets.items():
        value = meta.get("computed") or meta.get("raw")
        if value is not None:
            os.environ.setdefault(key, value)


def _load_config(config_path: Path) -> dict[str, Any]:
    raw = _load_yaml(config_path)
    config = _substitute_env(raw)
    if config.get("secrets_source", "env") == "doppler":
        _load_doppler_secrets(config)
        config = _substitute_env(raw)
    return config


def _load_calendar(calendar_path: Path) -> list[dict[str, Any]]:
    data = _load_yaml(calendar_path)
    return data if isinstance(data, list) else []


def _is_due(post: dict[str, Any], now: datetime) -> bool:
    scheduled_at = post.get("scheduled_at")
    if not scheduled_at:
        return False
    scheduled = datetime.fromisoformat(scheduled_at)
    if scheduled.tzinfo is None:
        scheduled = scheduled.replace(tzinfo=timezone.utc)
    return now >= scheduled


def _publish_single(config: dict[str, Any], platform: str, post: dict[str, Any], dry_run: bool) -> dict[str, Any]:
    module = PLATFORMS.get(platform)
    if not module:
        return {"success": False, "platform": platform, "message": "Unknown platform"}
    platform_config = config.get(platform, {})
    if not platform_config.get("enabled"):
        return {"success": False, "platform": platform, "message": "Platform disabled"}
    return module.publish(platform_config, post, dry_run=dry_run)


def _publish_post(config: dict[str, Any], post: dict[str, Any], dry_run: bool) -> dict[str, Any]:
    results = {"id": post.get("id", ""), "scheduled_at": post.get("scheduled_at", ""), "platforms": []}
    for platform in post.get("platforms", []):
        result = _publish_single(config, platform, post, dry_run)
        results["platforms"].append(result)
    return results


def _due_posts(calendar: list[dict[str, Any]], now: datetime) -> list[dict[str, Any]]:
    return [post for post in calendar if _is_due(post, now) and not post.get("published")]


def _load_state(state_path: Path) -> dict[str, Any]:
    if state_path.exists():
        return _load_yaml(state_path)
    return {}


def _save_state(state_path: Path, state: dict[str, Any]) -> None:
    with state_path.open("w") as f:
        yaml.safe_dump(state, f)


def _update_calendar(calendar_path: Path, calendar: list[dict[str, Any]]) -> None:
    with calendar_path.open("w") as f:
        yaml.safe_dump(calendar, f, sort_keys=False)


def run(config_path: Path, calendar_path: Path, state_path: Path, now: datetime | None = None, dry_run: bool | None = None) -> list[dict[str, Any]]:
    config = _load_config(config_path)
    calendar = _load_calendar(calendar_path)
    state = _load_state(state_path)
    if now is None:
        now = datetime.now(timezone.utc)
    if dry_run is None:
        dry_run = config.get("dry_run", True)

    results = []
    for post in _due_posts(calendar, now):
        if state.get("posted", {}).get(post.get("id", "")):
            continue
        result = _publish_post(config, post, dry_run)
        results.append(result)
        if all(r.get("success") for r in result["platforms"]):
            post["published"] = True
        state.setdefault("posted", {})[post.get("id", "")] = result

    _save_state(state_path, state)
    _update_calendar(calendar_path, calendar)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="CrewCircle local social media publisher")
    parser.add_argument("--config", default="scripts/social/secret/config.yaml", help="Path to config YAML")
    parser.add_argument("--calendar", default="scripts/social/calendar.yaml", help="Path to calendar YAML")
    parser.add_argument("--state", default="scripts/social/secret/state.yaml", help="Path to state YAML")
    parser.add_argument("--dry-run", action="store_true", help="Log without publishing")
    parser.add_argument("--now", help="Override current time (ISO 8601)")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    config_path = Path(args.config)
    calendar_path = Path(args.calendar)
    state_path = Path(args.state)

    if not config_path.exists():
        logger.error("Config not found: %s", config_path)
        return 1
    if not calendar_path.exists():
        logger.error("Calendar not found: %s", calendar_path)
        return 1

    now = datetime.fromisoformat(args.now) if args.now else None
    results = run(config_path, calendar_path, state_path, now=now, dry_run=args.dry_run)
    for result in results:
        logger.info("Posted %s: %s", result["id"], result["platforms"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
