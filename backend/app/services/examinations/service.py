from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.examinations import ExaminationRepository


class ExaminationServiceError(Exception):
    """Raised when examination operations fail."""


@dataclass(slots=True)
class ExaminationResultDTO:
    exam_id: int
    student_id: int
    score: Optional[float]
    grade: Optional[str]


class ExaminationService:
    def __init__(self, examination_repository: ExaminationRepository) -> None:
        self._examination_repository = examination_repository

    async def submit_result(self, exam_id: int, student_id: int, score: Optional[float], grade: Optional[str]) -> ExaminationResultDTO:
        if score is not None and score < 0:
            raise ExaminationServiceError("Score cannot be negative")

        return ExaminationResultDTO(exam_id=exam_id, student_id=student_id, score=score, grade=grade)
