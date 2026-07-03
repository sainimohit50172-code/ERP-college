from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TeacherBase(BaseModel):
    employee_id: int
    teacher_code: Optional[str] = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    teacher_code: Optional[str] = None


class TeacherDetail(TeacherBase):
    id: int
    created_at: datetime
    updated_at: datetime


class TeacherListItem(TeacherDetail):
    pass


class TeacherResponse(TeacherDetail):
    pass
