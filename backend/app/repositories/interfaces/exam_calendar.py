from __future__ import annotations

from abc import ABC

from app.models.exam_calendar import ExamCalendar
from app.repositories.interfaces.base import BaseRepository


class ExamCalendarRepository(BaseRepository[ExamCalendar], ABC):
    pass
