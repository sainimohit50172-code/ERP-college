from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.attendance import AttendanceRecord
from app.repositories.interfaces.attendance import AttendanceRepository
from app.repositories.interfaces.base import RepositoryError
from app.repositories.mysql.base import MySQLRepository


class MySQLAttendanceRepository(MySQLRepository[AttendanceRecord], AttendanceRepository):
    def __init__(self, session):
        super().__init__(session, AttendanceRecord)

    async def get_attendance_by_date(self, student_id: int, date_value: str) -> list[AttendanceRecord]:
        try:
            stmt = select(AttendanceRecord).where(AttendanceRecord.student_id == student_id, AttendanceRecord.date == date_value)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def mark_attendance_record(self, student_id: int, date_value: str, status: str) -> AttendanceRecord:
        try:
            record = AttendanceRecord(student_id=student_id, date=date_value, status=status)
            self.session.add(record)
            await self._run_sync(lambda: self.session.commit())
            await self._run_sync(lambda: self.session.refresh(record))
            return record
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def mark_attendance(self, student_id: int, date_value: str, status: str) -> AttendanceRecord:
        return await self.mark_attendance_record(student_id, date_value, status)

    async def get_attendance_summary(self, student_id: int) -> dict[str, int]:
        return {"total": 0}
