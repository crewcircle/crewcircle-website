"""
FastAPI dependencies for Supabase Auth and multi-tenant org access.

Usage in your FastAPI app:

    from crewcircle_auth import require_auth, require_org, get_current_user, get_current_org

    @app.get("/protected")
    async def protected(user=Depends(require_auth)):
        return {"user_id": user.id}

    @app.get("/org/{org_id}")
    async def org_route(membership=Depends(require_org)):
        return {"org": membership.org}
"""

from __future__ import annotations

from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from supabase import Client

from .client import create_supabase_client
from .models import Organization, OrganizationMember, UserWithOrg


def _get_client() -> Client:
    """Factory for Supabase anon client (injected per-request)."""
    return create_supabase_client()


def _extract_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract Bearer token from Authorization header."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
        )

    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format",
        )

    return parts[1]


def _get_user_from_token(
    token: str,
    client: Client = Depends(_get_client),
) -> dict:
    """Verify the JWT and return the Supabase user dict."""
    try:
        response = client.auth.get_user(token)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return {"user": response.user, "token": token, "client": client}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Auth verification failed: {exc}",
        )


async def get_current_user(
    authorization: Optional[str] = Header(None),
    client: Client = Depends(_get_client),
) -> UserWithOrg:
    """
    FastAPI dependency: returns the authenticated user enriched with org context.

    Requires a valid Bearer token in the Authorization header.
    """
    token = _extract_token(authorization)
    result = _get_user_from_token(token, client)
    sb_user = result["user"]

    org_id: Optional[str] = None
    if sb_user.app_metadata and "org_id" in sb_user.app_metadata:
        org_id = sb_user.app_metadata["org_id"]
    elif sb_user.user_metadata and "org_id" in sb_user.user_metadata:
        org_id = sb_user.user_metadata["org_id"]

    org = None
    role = None
    if org_id:
        org_res = (
            client.table("organizations")
            .select("*")
            .eq("id", org_id)
            .single()
            .execute()
        )
        org = Organization(**org_res.data) if org_res.data else None

        role_res = (
            client.table("organization_members")
            .select("*, roles(*)")
            .eq("org_id", org_id)
            .eq("user_id", sb_user.id)
            .single()
            .execute()
        )
        if role_res.data and "roles" in role_res.data:
            role = Role(**role_res.data["roles"])

    return UserWithOrg(
        user_id=sb_user.id,
        email=sb_user.email or "",
        full_name=sb_user.user_metadata.get("full_name")
        or sb_user.user_metadata.get("name"),
        avatar_url=sb_user.user_metadata.get("avatar_url"),
        org=org,
        role=role,
    )


async def require_auth(
    authorization: Optional[str] = Header(None),
    client: Client = Depends(_get_client),
) -> dict:
    """
    FastAPI dependency: returns raw auth context dict.

    Use when you need the client and token directly:
        auth = Depends(require_auth)
        user = auth["user"]
        client = auth["client"]
    """
    token = _extract_token(authorization)
    return _get_user_from_token(token, client)


async def get_current_org(
    user: UserWithOrg = Depends(get_current_user),
) -> Optional[Organization]:
    """FastAPI dependency: returns the current org (or None)."""
    return user.org


async def require_org(
    org_id: str,
    user: UserWithOrg = Depends(get_current_user),
) -> OrganizationMember:
    """
    FastAPI dependency: verifies the user is a member of the given org.

    Raises 403 if the user is not a member.
    """
    if not user.org:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active organization",
        )

    if user.org.id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not a member of this organization",
        )

    return OrganizationMember(
        id="",
        org_id=user.org.id,
        user_id=user.user_id,
        role=user.role.name if user.role else "member",
        joined_at=user.org.created_at,
    )
