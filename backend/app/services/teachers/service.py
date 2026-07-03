from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.teachers import TeacherRepository


class TeacherServiceError(Exception):
    """Raised when teacher lifecycle operations fail."""


@dataclass(slots=True)
class TeacherDTO:
    id: Optional[int]
    employee_id: int
    teacher_code: Optional[str]


class TeacherService:
    def __init__(self, teacher_repository: TeacherRepository) -> None:
        self._teacher_repository = teacher_repository

    async def register_teacher(self, employee_id: int, teacher_code: Optional[str] = None) -> TeacherDTO:
        if employee_id is None:
            raise TeacherServiceError("employee_id is required")

        return TeacherDTO(id=None, employee_id=employee_id, teacher_code=teacher_code)
