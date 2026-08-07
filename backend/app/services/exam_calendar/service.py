from __future__ import annotations

from app.repositories.interfaces.exam_calendar import ExamCalendarRepository


class ExamCalendarServiceError(Exception):
    """Raised when exam calendar service operations fail."""


class ExamCalendarService:
    def __init__(self, repository: ExamCalendarRepository) -> None:
        self._repository = repository
