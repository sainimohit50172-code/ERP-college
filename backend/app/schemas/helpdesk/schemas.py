from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TicketAttachmentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticket_id: Optional[int] = Field(default=None, ge=1)
    filename: str = Field(min_length=1, max_length=255)
    url: str = Field(min_length=1, max_length=512)
    content_type: Optional[str] = Field(default=None, max_length=128)
    size: Optional[int] = Field(default=None, ge=0)
    uploaded_by_type: Optional[str] = Field(default=None, max_length=20)
    uploaded_by_id: Optional[int] = Field(default=None, ge=1)


class TicketAttachmentCreate(TicketAttachmentBase):
    pass


class TicketAttachmentUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticket_id: Optional[int] = Field(default=None, ge=1)
    filename: Optional[str] = Field(default=None, min_length=1, max_length=255)
    url: Optional[str] = Field(default=None, min_length=1, max_length=512)
    content_type: Optional[str] = Field(default=None, max_length=128)
    size: Optional[int] = Field(default=None, ge=0)
    uploaded_by_type: Optional[str] = Field(default=None, max_length=20)
    uploaded_by_id: Optional[int] = Field(default=None, ge=1)


class TicketAttachmentDetail(TicketAttachmentBase):
    id: int
    created_at: Optional[datetime] = None


class TicketAttachmentListItem(TicketAttachmentBase):
    id: int


class TicketAttachmentResponse(TicketAttachmentBase):
    id: int


class TicketBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticket_number: Optional[str] = Field(default=None, max_length=64)
    lodged_by_type: str = Field(default="Employee", max_length=20)
    lodged_by_id: int = Field(default=0, ge=0)
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = Field(default=None, max_length=64)
    category: Optional[str] = None
    priority: str = Field(default="Medium", max_length=20)
    impact: Optional[str] = None
    subject: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = Field(default="Open", max_length=20)
    assigned_to_type: Optional[str] = Field(default=None, max_length=64)
    assigned_to_id: Optional[int] = Field(default=None, ge=0)


class TicketCreate(TicketBase):
    attachment_ids: Optional[List[int]] = None


class TicketUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ticket_number: Optional[str] = Field(default=None, max_length=64)
    lodged_by_type: Optional[str] = Field(default=None, max_length=20)
    lodged_by_id: Optional[int] = Field(default=None, ge=0)
    requester_email: Optional[EmailStr] = None
    requester_phone: Optional[str] = Field(default=None, max_length=64)
    category: Optional[str] = None
    priority: Optional[str] = Field(default=None, max_length=20)
    impact: Optional[str] = None
    subject: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(default=None, max_length=20)
    assigned_to_type: Optional[str] = Field(default=None, max_length=64)
    assigned_to_id: Optional[int] = Field(default=None, ge=0)
    attachment_ids: Optional[List[int]] = None


class TicketDetail(TicketBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    attachments: Optional[List[TicketAttachmentDetail]] = None


class TicketListItem(TicketBase):
    id: int


class TicketResponse(TicketBase):
    id: int
