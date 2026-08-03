from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import date
from typing import Optional

from app.models.exam_calendar import ExamCalendar
from app.repositories.interfaces.base import BaseRepository


class ExamCalendarRepository(BaseRepository[ExamCalendar], ABC):
    @abstractmethod
    async def list_records(
        self,
        page: int,
        page_size: int,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
        academic_session: Optional[str] = None,
        exam_type: Optional[str] = None,
        exam_category: Optional[str] = None,
        status: Optional[str] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> tuple[list[ExamCalendar], int]:
        raise NotImplementedError

    @abstractmethod
    async def search_records(
        self,
        query: str,
        academic_session: Optional[str] = None,
        exam_type: Optional[str] = None,
        exam_category: Optional[str] = None,
        status: Optional[str] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> list[ExamCalendar]:
        raise NotImplementedError

    @abstractmethod
    async def get_by_name_and_session(
        self,
        exam_name: str,
        academic_session: str,
        exclude_id: Optional[int] = None,
    ) -> Optional[ExamCalendar]:
        raise NotImplementedError
