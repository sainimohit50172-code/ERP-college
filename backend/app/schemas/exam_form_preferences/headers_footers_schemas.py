from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CoeExamFormHeaderFooterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    institute_id: int = Field(alias="instituteId", ge=1)
    exam_type_id: int = Field(alias="examTypeId", ge=1)
    section_type: str = Field(alias="sectionType", min_length=1, max_length=16)
    template_type: str = Field(alias="templateType", min_length=1, max_length=16)
    html_content: str = Field(alias="htmlContent", min_length=1)
    status: str = Field(default="Active", min_length=1, max_length=32)

    @field_validator("section_type")
    @classmethod
    def validate_section(cls, value: str) -> str:
        value = value.title()
        if value not in {"Header", "Footer"}:
            raise ValueError("sectionType must be Header or Footer")
        return value

    @field_validator("template_type")
    @classmethod
    def validate_template(cls, value: str) -> str:
        value = value.title()
        if value not in {"Regular", "Reappear", "Special"}:
            raise ValueError("templateType must be Regular, Reappear, or Special")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in {"Active", "Inactive", "Draft"}:
            raise ValueError("status must be Active, Inactive, or Draft")
        return value


class CoeExamFormHeaderFooterCreate(CoeExamFormHeaderFooterBase):
    created_by: Optional[int] = Field(alias="createdBy", default=None)


class CoeExamFormHeaderFooterUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    html_content: Optional[str] = Field(alias="htmlContent", default=None, min_length=1)
    status: Optional[str] = Field(default=None, min_length=1, max_length=32)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class CoeExamFormHeaderFooterDetail(CoeExamFormHeaderFooterBase):
    id: int
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
