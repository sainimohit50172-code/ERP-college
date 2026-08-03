from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from sqlalchemy import func, or_, select, update
from sqlalchemy.exc import SQLAlchemyError

from app.models.exam_calendar import ExamCalendar
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.exam_calendar import ExamCalendarRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLExamCalendarRepository(MySQLRepository[ExamCalendar], ExamCalendarRepository):
    def __init__(self, session):
        super().__init__(session, ExamCalendar)

    def _build_base_stmt(self, include_deleted: bool = False):
        stmt = select(ExamCalendar)
        if not include_deleted:
            stmt = stmt.where(ExamCalendar.deleted_at.is_(None))
        return stmt

    async def get_by_id(self, entity_id: int) -> Optional[ExamCalendar]:
        try:
            stmt = self._build_base_stmt().where(ExamCalendar.id == entity_id)
            result = await self._execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_all(self, include_deleted: bool = False) -> List[ExamCalendar]:
        try:
            result = await self._execute(self._build_base_stmt(include_deleted=include_deleted))
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def search(self, query: str) -> List[ExamCalendar]:
        return await self.search_records(query)

    async def paginate(self, page: int, page_size: int) -> tuple[List[ExamCalendar], int]:
        return await self.list_records(page=page, page_size=page_size)

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
    ) -> tuple[List[ExamCalendar], int]:
        try:
            stmt = self._build_base_stmt()
            total_stmt = select(func.count(ExamCalendar.id))

            if academic_session:
                stmt = stmt.where(ExamCalendar.academic_session == academic_session)
                total_stmt = total_stmt.where(ExamCalendar.academic_session == academic_session)
            if exam_type:
                stmt = stmt.where(ExamCalendar.exam_type == exam_type)
                total_stmt = total_stmt.where(ExamCalendar.exam_type == exam_type)
            if exam_category:
                stmt = stmt.where(ExamCalendar.exam_category == exam_category)
                total_stmt = total_stmt.where(ExamCalendar.exam_category == exam_category)
            if status:
                stmt = stmt.where(ExamCalendar.status == status)
                total_stmt = total_stmt.where(ExamCalendar.status == status)
            if created_by:
                stmt = stmt.where(ExamCalendar.created_by == created_by)
                total_stmt = total_stmt.where(ExamCalendar.created_by == created_by)
            if updated_by:
                stmt = stmt.where(ExamCalendar.updated_by == updated_by)
                total_stmt = total_stmt.where(ExamCalendar.updated_by == updated_by)
            if start_date is not None:
                stmt = stmt.where(ExamCalendar.end_date >= start_date)
                total_stmt = total_stmt.where(ExamCalendar.end_date >= start_date)
            if end_date is not None:
                stmt = stmt.where(ExamCalendar.start_date <= end_date)
                total_stmt = total_stmt.where(ExamCalendar.start_date <= end_date)

            if sort_by:
                sort_field = {
                    "examName": ExamCalendar.exam_name,
                    "academicSession": ExamCalendar.academic_session,
                    "examType": ExamCalendar.exam_type,
                    "startDate": ExamCalendar.start_date,
                    "endDate": ExamCalendar.end_date,
                    "status": ExamCalendar.status,
                    "createdDate": ExamCalendar.created_date,
                    "createdBy": ExamCalendar.created_by,
                    "exam_name": ExamCalendar.exam_name,
                    "academic_session": ExamCalendar.academic_session,
                    "exam_type": ExamCalendar.exam_type,
                    "start_date": ExamCalendar.start_date,
                    "end_date": ExamCalendar.end_date,
                    "created_date": ExamCalendar.created_date,
                    "created_by": ExamCalendar.created_by,
                }.get(sort_by, ExamCalendar.exam_name)
                stmt = stmt.order_by(sort_field.asc() if sort_order.lower() != "desc" else sort_field.desc())

            total_result = await self._execute(total_stmt.where(ExamCalendar.deleted_at.is_(None)))
            total = int(total_result.scalar_one() or 0)
            stmt = stmt.offset((page - 1) * page_size).limit(page_size)
            result = await self._execute(stmt)
            return list(result.scalars().all()), total
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

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
    ) -> List[ExamCalendar]:
        try:
            normalized = str(query or "").strip().lower()
            stmt = self._build_base_stmt()
            if normalized:
                stmt = stmt.where(
                    or_(
                        ExamCalendar.exam_name.ilike(f"%{normalized}%"),
                        ExamCalendar.academic_session.ilike(f"%{normalized}%"),
                        ExamCalendar.exam_type.ilike(f"%{normalized}%"),
                        ExamCalendar.exam_category.ilike(f"%{normalized}%"),
                        ExamCalendar.status.ilike(f"%{normalized}%"),
                    )
                )
            if academic_session:
                stmt = stmt.where(ExamCalendar.academic_session == academic_session)
            if exam_type:
                stmt = stmt.where(ExamCalendar.exam_type == exam_type)
            if exam_category:
                stmt = stmt.where(ExamCalendar.exam_category == exam_category)
            if status:
                stmt = stmt.where(ExamCalendar.status == status)
            if created_by:
                stmt = stmt.where(ExamCalendar.created_by == created_by)
            if updated_by:
                stmt = stmt.where(ExamCalendar.updated_by == updated_by)
            if start_date is not None:
                stmt = stmt.where(ExamCalendar.end_date >= start_date)
            if end_date is not None:
                stmt = stmt.where(ExamCalendar.start_date <= end_date)
            result = await self._execute(stmt.order_by(ExamCalendar.created_at.desc()))
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_by_name_and_session(self, exam_name: str, academic_session: str, exclude_id: Optional[int] = None) -> Optional[ExamCalendar]:
        try:
            stmt = self._build_base_stmt().where(
                ExamCalendar.exam_name == exam_name,
                ExamCalendar.academic_session == academic_session,
            )
            if exclude_id is not None:
                stmt = stmt.where(ExamCalendar.id != exclude_id)
            result = await self._execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def delete(self, entity_id: int) -> bool:
        try:
            entity = await self.get_by_id(entity_id)
            if entity is None:
                return False
            entity.deleted_at = datetime.utcnow()
            entity.updated_at = datetime.utcnow()
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
                .values(deleted_at=datetime.utcnow(), updated_at=datetime.utcnow())
            )
            await self._commit()
            return len(entity_ids)
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
