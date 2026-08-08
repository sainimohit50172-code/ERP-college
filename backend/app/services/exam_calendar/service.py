from __future__ import annotations

from typing import Any

from fastapi import HTTPException, Request, status

from app.repositories.interfaces.exam_calendar import ExamCalendarRepository
from app.models.exam_calendar import ExamCalendar


class ExamCalendarServiceError(Exception):
    """Raised when exam calendar service operations fail."""


class ExamCalendarService:
    def __init__(self, repository: ExamCalendarRepository) -> None:
        self._repository = repository

    async def create(self, request: Request | None = None, **payload: Any) -> ExamCalendar:
        if request is not None:
            role = request.headers.get("X-User-Role", "").strip().lower()
            permission = request.headers.get("X-Permission", "").strip().lower()
            if role == "student" and permission == "create":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not authorized to create exam calendars")

        existing = await self._repository.get_all()
        for record in existing:
            if (
                record.exam_name == payload.get("exam_name") and
                record.academic_session == payload.get("academic_session") and
                record.exam_type == payload.get("exam_type") and
                record.start_date == payload.get("start_date") and
                record.end_date == payload.get("end_date")
            ):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate exam calendar entry")

        entity = ExamCalendar(**payload)
        return await self._repository.create(entity)
