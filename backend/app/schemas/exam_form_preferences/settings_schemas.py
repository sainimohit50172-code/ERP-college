from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class CoeExamFormPreferenceSettingsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    student_awake_status: bool = Field(alias="studentAwakeStatus", default=False)
    auto_approve: bool = Field(alias="autoApprove", default=False)
    personal_details_check: bool = Field(alias="personalDetailsCheck", default=False)
    exam_calendar_mode: str = Field(alias="examCalendarMode", default="Draft")


class CoeExamFormPreferenceSettingsUpdate(CoeExamFormPreferenceSettingsBase):
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class CoeExamFormPreferenceSettingsDetail(CoeExamFormPreferenceSettingsBase):
    id: int
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class CoeExamFormPreferenceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    academic_session_id: int = Field(alias="academicSessionId", ge=1)
    institute_id: int = Field(alias="instituteId", ge=1)
    course_id: int = Field(alias="courseId", ge=1)
    program_id: int = Field(alias="programId", ge=1)
    semester_id: int = Field(alias="semesterId", ge=1)
    exam_type_id: int = Field(alias="examTypeId", ge=1)
    status: str = Field(default="Active", min_length=1, max_length=32)

    @model_validator(mode="after")
    def validate_combination(self):
        if self.status not in {"Active", "Inactive", "Draft"}:
            raise ValueError("status must be Active, Inactive, or Draft")
        return self


class CoeExamFormPreferenceCreate(CoeExamFormPreferenceBase):
    created_by: Optional[int] = Field(alias="createdBy", default=None)


class CoeExamFormPreferenceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    academic_session_id: Optional[int] = Field(alias="academicSessionId", default=None, ge=1)
    institute_id: Optional[int] = Field(alias="instituteId", default=None, ge=1)
    course_id: Optional[int] = Field(alias="courseId", default=None, ge=1)
    program_id: Optional[int] = Field(alias="programId", default=None, ge=1)
    semester_id: Optional[int] = Field(alias="semesterId", default=None, ge=1)
    exam_type_id: Optional[int] = Field(alias="examTypeId", default=None, ge=1)
    status: Optional[str] = Field(default=None, min_length=1, max_length=32)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class CoeExamFormPreferenceDetail(CoeExamFormPreferenceBase):
    id: int
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
