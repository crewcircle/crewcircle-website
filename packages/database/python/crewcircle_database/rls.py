"""RLS helpers and policy builder."""

from __future__ import annotations


def set_org_id_sql(org_id: str) -> str:
    """Generate SQL to set request.org_id for the current transaction."""
    safe = org_id.replace("'", "''")
    return f"SET LOCAL request.org_id = '{safe}';"


def create_org_rls_policy(
    table_name: str,
    operation: str = "ALL",
) -> str:
    """Build an idempotent RLS policy that restricts rows by org_id.

    Args:
        table_name: The table (without schema prefix).
        operation: SQL operation type — 'ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'.
    """
    policy_name = f"org_isolation_{table_name}"
    using = (
        f"WITH CHECK (org_id = app.current_org_id())"
        if operation.upper() == "INSERT"
        else f"USING (org_id = app.current_org_id())"
    )
    for_clause = "FOR ALL" if operation.upper() == "ALL" else f"FOR {operation.upper()}"

    return (
        f"DO $$ BEGIN\n"
        f"  IF NOT EXISTS (\n"
        f"    SELECT 1 FROM pg_policies WHERE policyname = '{policy_name}' AND tablename = '{table_name}'\n"
        f"  ) THEN\n"
        f"    CREATE POLICY {policy_name} ON public.{table_name}\n"
        f"      {for_clause}\n"
        f"      {using};\n"
        f"  END IF;\n"
        f"END $$;"
    )


def enable_rls(table_name: str) -> str:
    """Build SQL to enable RLS on a table (idempotent via ALTER)."""
    return f"ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;"


def setup_table_rls(table_name: str) -> str:
    """Generate complete SQL: enable RLS + create org isolation policy."""
    return f"{enable_rls(table_name)}\n{create_org_rls_policy(table_name, 'ALL')}"
