from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PreferenceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    academic_session: str = Field(alias="academicSession", min_length=1, max_length=64)
    institute: str = Field(min_length=1, max_length=160)
    course: str = Field(min_length=1, max_length=160)
    program: Optional[str] = Field(default=None, max_length=160)
    semester: str = Field(min_length=1, max_length=64)
    exam_type: str = Field(alias="examType", min_length=1, max_length=128)
    form_opening_date: date = Field(alias="formOpeningDate")
    form_closing_date: date = Field(alias="formClosingDate")
    late_fee_date: Optional[date] = Field(alias="lateFeeDate", default=None)
    late_fee_amount: Decimal = Field(alias="lateFeeAmount", default=Decimal("0"), ge=0)
    without_late_fee: bool = Field(alias="withoutLateFee", default=True)
    with_late_fee: bool = Field(alias="withLateFee", default=False)
    maximum_subjects: int = Field(alias="maximumSubjects", default=8, ge=1, le=100)
    minimum_subjects: int = Field(alias="minimumSubjects", default=1, ge=1, le=100)
    allow_improvement: bool = Field(alias="allowImprovement", default=False)
    allow_back_paper: bool = Field(alias="allowBackPaper", default=False)
    allow_reappear: bool = Field(alias="allowReappear", default=False)
    allow_practical_only: bool = Field(alias="allowPracticalOnly", default=False)
    allow_theory_only: bool = Field(alias="allowTheoryOnly", default=False)
    status: str = Field(default="Active", max_length=32)
    remarks: Optional[str] = Field(default=None, max_length=4000)
    created_by: Optional[str] = Field(alias="createdBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    updated_date: Optional[date] = Field(alias="updatedDate", default=None)

    @field_validator("academic_session", "institute", "course", "semester", "exam_type", "status", mode="before")
    @classmethod
    def trim_required(cls, value):
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_dates_and_subjects(self):
        if self.form_closing_date < self.form_opening_date:
            raise ValueError("formClosingDate must be on or after formOpeningDate")
        if self.minimum_subjects > self.maximum_subjects:
            raise ValueError("minimumSubjects cannot exceed maximumSubjects")
        if not self.without_late_fee and not self.with_late_fee:
            raise ValueError("At least one fee option must be enabled")
        return self


class ExamFormPreferenceCreate(PreferenceBase):
    pass


class ExamFormPreferenceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    academic_session: Optional[str] = Field(alias="academicSession", default=None, min_length=1, max_length=64)
    institute: Optional[str] = Field(default=None, min_length=1, max_length=160)
    course: Optional[str] = Field(default=None, min_length=1, max_length=160)
    program: Optional[str] = Field(default=None, max_length=160)
    semester: Optional[str] = Field(default=None, min_length=1, max_length=64)
    exam_type: Optional[str] = Field(alias="examType", default=None, min_length=1, max_length=128)
    form_opening_date: Optional[date] = Field(alias="formOpeningDate", default=None)
    form_closing_date: Optional[date] = Field(alias="formClosingDate", default=None)
    late_fee_date: Optional[date] = Field(alias="lateFeeDate", default=None)
    late_fee_amount: Optional[Decimal] = Field(alias="lateFeeAmount", default=None, ge=0)
    without_late_fee: Optional[bool] = Field(alias="withoutLateFee", default=None)
    with_late_fee: Optional[bool] = Field(alias="withLateFee", default=None)
    maximum_subjects: Optional[int] = Field(alias="maximumSubjects", default=None, ge=1, le=100)
    minimum_subjects: Optional[int] = Field(alias="minimumSubjects", default=None, ge=1, le=100)
    allow_improvement: Optional[bool] = Field(alias="allowImprovement", default=None)
    allow_back_paper: Optional[bool] = Field(alias="allowBackPaper", default=None)
    allow_reappear: Optional[bool] = Field(alias="allowReappear", default=None)
    allow_practical_only: Optional[bool] = Field(alias="allowPracticalOnly", default=None)
    allow_theory_only: Optional[bool] = Field(alias="allowTheoryOnly", default=None)
    status: Optional[str] = Field(default=None, max_length=32)
    remarks: Optional[str] = Field(default=None, max_length=4000)
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    updated_date: Optional[date] = Field(alias="updatedDate", default=None)


class ExamFormPreferenceDetail(PreferenceBase):
    id: int
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class HeaderFooterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    header_name: str = Field(alias="headerName", min_length=1, max_length=160)
    header_html: str = Field(alias="headerHtml", min_length=1)
    footer_html: str = Field(alias="footerHtml", min_length=1)
    institute: str = Field(min_length=1, max_length=160)
    exam_type: str = Field(alias="examType", min_length=1, max_length=128)
    logo: Optional[str] = Field(default=None, max_length=500)
    watermark: Optional[str] = Field(default=None, max_length=500)
    status: str = Field(default="Active", max_length=32)
    created_by: Optional[str] = Field(alias="createdBy", default=None, max_length=128)
    created_date: Optional[date] = Field(alias="createdDate", default=None)
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    updated_date: Optional[date] = Field(alias="updatedDate", default=None)

    @field_validator("header_name", "institute", "exam_type", "status", mode="before")
    @classmethod
    def trim_required(cls, value):
        return value.strip() if isinstance(value, str) else value


class ExamFormHeaderFooterCreate(HeaderFooterBase):
    pass


class ExamFormHeaderFooterUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    header_name: Optional[str] = Field(alias="headerName", default=None, min_length=1, max_length=160)
    header_html: Optional[str] = Field(alias="headerHtml", default=None, min_length=1)
    footer_html: Optional[str] = Field(alias="footerHtml", default=None, min_length=1)
    institute: Optional[str] = Field(default=None, min_length=1, max_length=160)
    exam_type: Optional[str] = Field(alias="examType", default=None, min_length=1, max_length=128)
    logo: Optional[str] = Field(default=None, max_length=500)
    watermark: Optional[str] = Field(default=None, max_length=500)
    status: Optional[str] = Field(default=None, max_length=32)
    updated_by: Optional[str] = Field(alias="updatedBy", default=None, max_length=128)
    updated_date: Optional[date] = Field(alias="updatedDate", default=None)


class ExamFormHeaderFooterDetail(HeaderFooterBase):
    id: int
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
