from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TeacherBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    teacher_code: Optional[str] = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    teacher_code: Optional[str] = None


class TeacherDetail(TeacherBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class TeacherListItem(TeacherDetail):
    pass


class TeacherResponse(TeacherDetail):
    pass
