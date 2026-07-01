from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ExamBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=100)
    exam_type: str = Field(default="semester", max_length=50)
    exam_date: date
    status: str = Field(default="scheduled", max_length=20)


class ExamCreate(ExamBase):
    pass


class ExamUpdate(ExamBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    exam_date: Optional[date] = None


class ExamDetail(ExamBase):
    id: int
    created_at: Optional[datetime] = None


class ExamListItem(ExamBase):
    id: int


class ExamResponse(ExamBase):
    id: int


class ExamResultBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    exam_id: int
    marks_obtained: Decimal = Field(ge=0)
    grade: Optional[str] = Field(default=None, max_length=10)


class ExamResultCreate(ExamResultBase):
    pass


class ExamResultUpdate(ExamResultBase):
    student_id: Optional[int] = None
    exam_id: Optional[int] = None
    marks_obtained: Optional[Decimal] = Field(default=None, ge=0)


class ExamResultDetail(ExamResultBase):
    id: int
    created_at: Optional[datetime] = None


class ExamResultListItem(ExamResultBase):
    id: int


class ExamResultResponse(ExamResultBase):
    id: int
