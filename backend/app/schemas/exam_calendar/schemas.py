from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExamCalendarBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    exam_name: str = Field(alias="examName", min_length=1, max_length=255)
    academic_session: str = Field(alias="academicSession", min_length=1, max_length=64)
    exam_type: str = Field(alias="examType", min_length=1, max_length=128)
    exam_category: Optional[str] = Field(alias="examCategory", default=None, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="Upcoming", max_length=64)
    start_date: Optional[date] = Field(alias="startDate", default=None)
    end_date: Optional[date] = Field(alias="endDate", default=None)
    created_by: Optional[str] = Field(alias="createdBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)


class ExamCalendarCreate(ExamCalendarBase):
    pass


class ExamCalendarUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    exam_name: Optional[str] = Field(alias="examName", default=None, min_length=1, max_length=255)
    academic_session: Optional[str] = Field(alias="academicSession", default=None, min_length=1, max_length=64)
    exam_type: Optional[str] = Field(alias="examType", default=None, min_length=1, max_length=128)
    exam_category: Optional[str] = Field(alias="examCategory", default=None, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None, max_length=64)
    start_date: Optional[date] = Field(alias="startDate", default=None)
    end_date: Optional[date] = Field(alias="endDate", default=None)
    created_by: Optional[str] = Field(alias="createdBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)


class ExamCalendarDetail(ExamCalendarBase):
    id: int
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class ExamCalendarListItem(ExamCalendarBase):
    id: int
