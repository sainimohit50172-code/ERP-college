from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from sqlalchemy import func, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.models.exam_calendar import ExamCalendar
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.exam_calendar import ExamCalendarRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLExamCalendarRepository(MySQLRepository[ExamCalendar], ExamCalendarRepository):
    def __init__(self, session):
        super().__init__(session, ExamCalendar)

    async def get_by_id(self, entity_id: int) -> Optional[ExamCalendar]:
        try:
            stmt = select(ExamCalendar).where(ExamCalendar.id == entity_id, ExamCalendar.deleted_at.is_(None))
            result = await self._execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_all(self, include_deleted: bool = False) -> List[ExamCalendar]:
        try:
            stmt = select(ExamCalendar)
            if not include_deleted:
                stmt = stmt.where(ExamCalendar.deleted_at.is_(None))
            result = await self._execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def search(self, query: str) -> List[ExamCalendar]:
        try:
            normalized = str(query or "").strip().lower()
            if not normalized:
                return await self.get_all()

            stmt = select(ExamCalendar).where(
                ExamCalendar.deleted_at.is_(None),
                (
                    ExamCalendar.exam_name.ilike(f"%{normalized}%") |
                    ExamCalendar.academic_session.ilike(f"%{normalized}%") |
                    ExamCalendar.exam_type.ilike(f"%{normalized}%") |
                    ExamCalendar.exam_category.ilike(f"%{normalized}%") |
                    ExamCalendar.status.ilike(f"%{normalized}%")
                )
            )
            result = await self._execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def paginate(self, page: int, page_size: int) -> tuple[List[ExamCalendar], int]:
        try:
            total_stmt = select(func.count(ExamCalendar.id)).where(ExamCalendar.deleted_at.is_(None))
            total_result = await self._execute(total_stmt)
            total = int(total_result.scalar_one() or 0)
            stmt = select(ExamCalendar).where(ExamCalendar.deleted_at.is_(None)).offset((page - 1) * page_size).limit(page_size)
            result = await self._execute(stmt)
            return list(result.scalars().all()), total
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def delete(self, entity_id: int) -> bool:
        try:
            entity = await self.get_by_id(entity_id)
            if entity is None:
                return False
            await self._execute(
                update(ExamCalendar)
                .where(ExamCalendar.id == entity_id)
                .values(deleted_at=datetime.utcnow())
            )
            await self._commit()
            return True
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def bulk_delete(self, entity_ids: list[int]) -> int:
        if not entity_ids:
            return 0
        try:
            await self._execute(
                update(ExamCalendar)
                .where(ExamCalendar.id.in_(entity_ids))
                .values(deleted_at=datetime.utcnow())
            )
            await self._commit()
            return len(entity_ids)
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
