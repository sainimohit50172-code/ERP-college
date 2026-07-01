from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AuditLogBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    actor_id: int
    action: str = Field(min_length=1, max_length=100)
    entity_type: str = Field(min_length=1, max_length=100)
    entity_id: int
    details: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogUpdate(AuditLogBase):
    actor_id: Optional[int] = None
    action: Optional[str] = Field(default=None, min_length=1, max_length=100)
    entity_type: Optional[str] = Field(default=None, min_length=1, max_length=100)
    entity_id: Optional[int] = None


class AuditLogDetail(AuditLogBase):
    id: int
    created_at: Optional[datetime] = None


class AuditLogListItem(AuditLogBase):
    id: int


class AuditLogResponse(AuditLogBase):
    id: int


class AuditActionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None


class AuditActionCreate(AuditActionBase):
    pass


class AuditActionUpdate(AuditActionBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class AuditActionDetail(AuditActionBase):
    id: int
    created_at: Optional[datetime] = None


class AuditActionListItem(AuditActionBase):
    id: int


class AuditActionResponse(AuditActionBase):
    id: int
