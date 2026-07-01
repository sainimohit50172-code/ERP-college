from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class StudentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    admission_number: str = Field(min_length=1, max_length=50)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(default=None, max_length=10)
    status: str = Field(default="active", max_length=20)


class StudentCreate(StudentBase):
    pass


class StudentUpdate(StudentBase):
    admission_number: Optional[str] = Field(default=None, min_length=1, max_length=50)
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class StudentDetail(StudentBase):
    id: int
    created_at: Optional[date] = None


class StudentListItem(StudentBase):
    id: int


class StudentResponse(StudentBase):
    id: int
