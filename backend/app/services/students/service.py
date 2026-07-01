from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.students import StudentRepository


class StudentServiceError(Exception):
    """Raised when student lifecycle operations fail."""


@dataclass(slots=True)
class StudentDTO:
    id: Optional[int]
    admission_number: Optional[str]
    first_name: str
    last_name: Optional[str]
    status: str


class StudentService:
    def __init__(self, student_repository: StudentRepository) -> None:
        self._student_repository = student_repository

    async def enroll_student(self, admission_number: str, first_name: str, last_name: str, status: str = "Active") -> StudentDTO:
        existing = await self._student_repository.find_by_admission_no(admission_number)
        if existing is not None:
            raise StudentServiceError("Student admission number already exists")

        return StudentDTO(
            id=None,
            admission_number=admission_number,
            first_name=first_name,
            last_name=last_name,
            status=status,
        )
