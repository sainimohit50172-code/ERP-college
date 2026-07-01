from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.attendance import AttendanceRecord
from app.repositories.interfaces.base import BaseRepository


class AttendanceRepository(BaseRepository[AttendanceRecord], ABC):
    @abstractmethod
    async def mark_attendance(self, student_id: int, date_value: str, status: str) -> AttendanceRecord:
        raise NotImplementedError

    @abstractmethod
    async def get_attendance_summary(self, student_id: int) -> dict[str, int]:
        raise NotImplementedError
