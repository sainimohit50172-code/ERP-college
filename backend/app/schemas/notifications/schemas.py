from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class NotificationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recipient_id: int
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=2000)
    status: str = Field(default="pending", max_length=20)


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(NotificationBase):
    recipient_id: Optional[int] = None
    subject: Optional[str] = Field(default=None, min_length=1, max_length=200)
    message: Optional[str] = Field(default=None, min_length=1, max_length=2000)


class NotificationDetail(NotificationBase):
    id: int
    created_at: Optional[datetime] = None


class NotificationListItem(NotificationBase):
    id: int


class NotificationResponse(NotificationBase):
    id: int


class NotificationTemplateBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=100)
    subject_template: str = Field(min_length=1, max_length=200)
    body_template: str = Field(min_length=1, max_length=4000)


class NotificationTemplateCreate(NotificationTemplateBase):
    pass


class NotificationTemplateUpdate(NotificationTemplateBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    subject_template: Optional[str] = Field(default=None, min_length=1, max_length=200)
    body_template: Optional[str] = Field(default=None, min_length=1, max_length=4000)


class NotificationTemplateDetail(NotificationTemplateBase):
    id: int
    created_at: Optional[datetime] = None


class NotificationTemplateListItem(NotificationTemplateBase):
    id: int


class NotificationTemplateResponse(NotificationTemplateBase):
    id: int
