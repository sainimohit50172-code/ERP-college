from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    deleted_by: Optional[str] = Field(alias="deletedBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)

    @field_validator("exam_name", "academic_session", "exam_type", "status", mode="before")
    @classmethod
    def _trim_required_string(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("exam_category", "description", "created_by", "updated_by", "deleted_by", mode="before")
    @classmethod
    def _trim_optional_string(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @model_validator(mode="after")
    def _validate_date_range(self):
        if self.start_date is not None and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


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
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    deleted_by: Optional[str] = Field(alias="deletedBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)

    @field_validator("exam_name", "academic_session", "exam_type", "status", mode="before")
    @classmethod
    def _trim_required_string(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("exam_category", "description", "created_by", "updated_by", "deleted_by", mode="before")
    @classmethod
    def _trim_optional_string(cls, value):
        if value is None:
            return value
        if isinstance(value, str):
            value = value.strip()
            return value or None
        return value

    @model_validator(mode="after")
    def _validate_date_range(self):
        if self.start_date is not None and self.end_date is not None and self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class ExamCalendarDetail(ExamCalendarBase):
    id: int
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
    deleted_at: Optional[datetime] = Field(alias="deletedAt", default=None)


class ExamCalendarListItem(ExamCalendarBase):
    id: int
