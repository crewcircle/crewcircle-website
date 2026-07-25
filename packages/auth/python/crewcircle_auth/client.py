"""
Supabase client factories for FastAPI backends.

All secrets come from environment variables — never hardcoded.
"""

import os
from supabase import create_client, Client


def create_supabase_client() -> Client:
    """
    Create an anon-key Supabase client (RLS-enforced).

    Reads SUPABASE_URL and SUPABASE_ANON_KEY from env.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_ANON_KEY")

    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables"
        )

    return create_client(url, key)


def create_service_client() -> Client:
    """
    Create a service-role Supabase client (bypasses RLS).

    Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from env.
    Use only for admin operations — never expose to the frontend.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
        )

    return create_client(url, key)
