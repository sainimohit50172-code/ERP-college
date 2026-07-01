from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdmissionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    applicant_name: str = Field(min_length=1, max_length=200)
    program: str = Field(min_length=1, max_length=100)
    applicant_email: Optional[EmailStr] = None
    applicant_phone: Optional[str] = Field(default=None, max_length=20)
    status: str = Field(default="pending", max_length=20)
    admission_date: Optional[date] = None


class AdmissionCreate(AdmissionBase):
    pass


class AdmissionUpdate(AdmissionBase):
    applicant_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    program: Optional[str] = Field(default=None, min_length=1, max_length=100)


class AdmissionDetail(AdmissionBase):
    id: int
    created_at: Optional[date] = None


class AdmissionListItem(AdmissionBase):
    id: int


class AdmissionResponse(AdmissionBase):
    id: int
