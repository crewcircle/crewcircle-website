# packages/account-setup/config.py
"""
Single source of configuration for the account-setup package.
Reads from environment variables ONLY — no hardcoded values anywhere.

Load order (highest priority first):
  1. Actual environment variables (shell exports, CI secrets)
  2. .env.local in monorepo root
  3. .env.example as reference (never has real values)

Usage in every creator:
    from config import cfg
    email = cfg.email
    company = cfg.company
"""
from __future__ import annotations
import os
from dataclasses import dataclass
from pathlib import Path


def _load_dotenv(path: Path) -> None:
    """Minimal dotenv loader — no extra dependencies."""
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Only set if not already set by real environment
        if key not in os.environ and value:
            os.environ[key] = value


# Load .env.local from monorepo root (two levels up from this file)
_repo_root = Path(__file__).parent.parent.parent
_load_dotenv(_repo_root / ".env.local")
# Also try local .env.local in this package (for isolated testing)
_load_dotenv(Path(__file__).parent / ".env.local")


def _require(key: str) -> str:
    val = os.environ.get(key, "")
    if not val:
        raise EnvironmentError(
            f"\n\nMissing required env var: {key}\n"
            f"Add it to .env.local in the monorepo root.\n"
            f"See .env.example for reference.\n"
        )
    return val


def _get(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


@dataclass(frozen=True)
class Config:
    # Identity
    email:           str
    first_name:      str
    last_name:       str
    full_name:       str
    company:         str
    abn:             str
    domain:          str
    au_phone:        str
    github_username: str

    # Doppler
    doppler_master_project: str
    sentry_org:             str

    # Derived
    @property
    def api_domain(self) -> str:
        return f"api.{self.domain}"

    @property
    def token_name(self) -> str:
        """Consistent name for automation tokens across all services."""
        return f"{self.github_username}-automation"

    def as_creator_ctx(self) -> dict:
        """Dict passed to every creator function."""
        return {
            "email":      self.email,
            "first_name": self.first_name,
            "last_name":  self.last_name,
            "full_name":  self.full_name,
            "company":    self.company,
            "abn":        self.abn,
            "domain":     self.domain,
            "phone":      self.au_phone,
            "github_username": self.github_username,
            "token_name": self.token_name,
        }


def load_config() -> Config:
    first = _require("CC_FIRST_NAME")
    last  = _require("CC_LAST_NAME")
    return Config(
        email           = _require("CC_EMAIL"),
        first_name      = first,
        last_name       = last,
        full_name       = f"{first} {last}",
        company         = _require("CC_COMPANY"),
        abn             = _require("CC_ABN"),
        domain          = _require("CC_DOMAIN"),
        au_phone        = _require("CC_AU_PHONE"),
        github_username = _require("CC_GITHUB_USERNAME"),
        doppler_master_project = _get("CC_DOPPLER_MASTER_PROJECT", "crewcircle-master"),
        sentry_org      = _get("CC_SENTRY_ORG", ""),
    )


# Module-level singleton — imported by all creators
cfg = load_config()
