from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.examinations import Exam, ExamResult
from app.repositories.interfaces.base import BaseRepository


class ExaminationRepository(BaseRepository[Exam], ABC):
    @abstractmethod
    async def get_results_for_exam(self, exam_id: int) -> list[ExamResult]:
        raise NotImplementedError

    @abstractmethod
    async def submit_result(self, result: ExamResult) -> ExamResult:
        raise NotImplementedError
