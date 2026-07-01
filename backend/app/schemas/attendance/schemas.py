from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AttendanceRecordBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    date: date
    status: str = Field(default="present", max_length=20)
    remarks: Optional[str] = None


class AttendanceRecordCreate(AttendanceRecordBase):
    pass


class AttendanceRecordUpdate(AttendanceRecordBase):
    student_id: Optional[int] = None
    date: Optional[date] = None


class AttendanceRecordDetail(AttendanceRecordBase):
    id: int
    created_at: Optional[datetime] = None


class AttendanceRecordListItem(AttendanceRecordBase):
    id: int


class AttendanceRecordResponse(AttendanceRecordBase):
    id: int
