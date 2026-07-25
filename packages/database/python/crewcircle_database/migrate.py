"""Migration runner using SQL files."""

from __future__ import annotations

import glob
import os
from pathlib import Path
from typing import Any


def run_migrations(
    conn: Any,
    migrations_dir: str | Path | None = None,
    *,
    dry_run: bool = False,
) -> list[str]:
    """Run SQL migration files in order against a psycopg/psycopg2 connection.

    Args:
        conn: A psycopg or psycopg2 connection.
        migrations_dir: Directory containing .sql files. Defaults to
            ``packages/database/migrations/`` relative to this package.
        dry_run: If True, print SQL without executing.

    Returns:
        List of migration file names that were applied.
    """
    if migrations_dir is None:
        migrations_dir = Path(__file__).parent.parent.parent / "migrations"
    else:
        migrations_dir = Path(migrations_dir)

    if not migrations_dir.is_dir():
        raise FileNotFoundError(f"Migrations directory not found: {migrations_dir}")

    sql_files = sorted(glob.glob(str(migrations_dir / "*.sql")))
    applied: list[str] = []

    for sql_path in sql_files:
        sql_content = Path(sql_path).read_text()
        file_name = os.path.basename(sql_path)

        if dry_run:
            print(f"--- DRY RUN: {file_name} ---")
            print(sql_content)
            print(f"--- END: {file_name} ---\n")
            applied.append(file_name)
            continue

        try:
            cur = conn.cursor()
            cur.execute(sql_content)
            if hasattr(conn, "commit"):
                conn.commit()
            applied.append(file_name)
            print(f"Applied: {file_name}")
        except Exception as e:
            if hasattr(conn, "rollback"):
                conn.rollback()
            print(f"FAILED: {file_name} — {e}")
            raise

    return applied
