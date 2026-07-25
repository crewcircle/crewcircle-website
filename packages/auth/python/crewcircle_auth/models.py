"""
Pydantic models for the CrewCircle auth and organization model.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class OrgStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class Role(BaseModel):
    id: str
    name: str
    permissions: List[str] = Field(default_factory=list)


class Organization(BaseModel):
    id: str
    name: str
    slug: str
    owner_id: str
    status: OrgStatus = OrgStatus.ACTIVE
    created_at: datetime
    updated_at: datetime


class OrganizationMember(BaseModel):
    id: str
    org_id: str
    user_id: str
    role: str = "member"
    joined_at: datetime


class UserWithOrg(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    org: Optional[Organization] = None
    role: Optional[Role] = None
