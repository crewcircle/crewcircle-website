"""Supabase/postgres client factory with org_id context manager."""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Any, Generator

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None  # type: ignore[assignment]
    Client = None  # type: ignore[assignment,misc]

try:
    import psycopg
    from psycopg.rows import dict_row

    HAS_PSYCOPG3 = True
except ImportError:
    HAS_PSYCOPG3 = False

try:
    import psycopg2
    import psycopg2.extras

    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False


def _require_env(name: str, fallback: str | None = None) -> str:
    value = fallback or os.environ.get(name)
    if not value:
        raise ValueError(
            f"[crewcircle/database] Missing environment variable: {name}. "
            "Set it via Doppler or your .env file."
        )
    return value


def create_database_client(
    *,
    service_role: bool = False,
    org_id: str | None = None,
    supabase_url: str | None = None,
    supabase_key: str | None = None,
) -> Any:
    """Create a Supabase Python client.

    Args:
        service_role: Use the service-role key (bypasses RLS). Server only.
        org_id: Set the org_id claim for RLS.
        supabase_url: Override SUPABASE_URL env var.
        supabase_key: Override the key (anon or service-role).
    """
    if create_client is None:
        raise ImportError("Install supabase: pip install supabase")

    url = supabase_url or _require_env("SUPABASE_URL")

    if service_role:
        key = supabase_key or _require_env("SUPABASE_SERVICE_ROLE_KEY")
    else:
        key = supabase_key or _require_env("SUPABASE_ANON_KEY")

    client = create_client(url, key)

    if org_id:
        client.postgrest.session.headers["x-cc-org-id"] = org_id

    return client


def create_service_client(
    *,
    org_id: str | None = None,
    supabase_url: str | None = None,
    supabase_key: str | None = None,
) -> Any:
    """Shorthand for create_database_client(service_role=True)."""
    return create_database_client(
        service_role=True,
        org_id=org_id,
        supabase_url=supabase_url,
        supabase_key=supabase_key,
    )


def create_org_client(
    org_id: str,
    *,
    supabase_url: str | None = None,
    supabase_key: str | None = None,
) -> Any:
    """Create a client scoped to a specific organisation."""
    return create_database_client(
        org_id=org_id,
        supabase_url=supabase_url,
        supabase_key=supabase_key,
    )


class OrgContext:
    """Context manager that sets org_id on a psycopg connection for RLS.

    Usage:
        with OrgContext(conn, "org_abc123"):
            cur = conn.execute("SELECT * FROM organizations")
    """

    def __init__(self, conn: Any, org_id: str) -> None:
        self.conn = conn
        self.org_id = org_id

    def __enter__(self) -> "OrgContext":
        self._set_config(self.conn, self.org_id)
        return self

    def __exit__(self, *args: Any) -> None:
        self._clear_config(self.conn)

    @staticmethod
    def _set_config(conn: Any, org_id: str) -> None:
        safe_org_id = org_id.replace("'", "''")
        if HAS_PSYCOPG3 and hasattr(conn, "execute"):
            conn.execute(f"SET LOCAL request.org_id = '{safe_org_id}'")
        elif HAS_PSYCOPG2 and hasattr(conn, "cursor"):
            cur = conn.cursor()
            cur.execute(f"SET LOCAL request.org_id = '{safe_org_id}'")
        else:
            raise RuntimeError("No supported postgres driver found (install psycopg or psycopg2)")

    @staticmethod
    def _clear_config(conn: Any) -> None:
        if HAS_PSYCOPG3 and hasattr(conn, "execute"):
            conn.execute("SET LOCAL request.org_id = ''")
        elif HAS_PSYCOPG2 and hasattr(conn, "cursor"):
            cur = conn.cursor()
            cur.execute("SET LOCAL request.org_id = ''")
