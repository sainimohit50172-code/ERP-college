from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.exc import SQLAlchemyError

from app.models.exam_form_preferences import CoeExamFormPreference, ExamFormHeaderFooter, ExamFormPreference
from app.repositories.interfaces.base import RepositoryError
from app.repositories.mysql.base import MySQLRepository


class ExamFormRepository(MySQLRepository[Any]):
    def __init__(self, session, model_type):
        super().__init__(session, model_type)

    def _base(self):
        stmt = select(self.model_type)
        if hasattr(self.model_type, "deleted_at"):
            stmt = stmt.where(self.model_type.deleted_at.is_(None))
        return stmt

    async def list_records(self, page: int, page_size: int, query: Optional[str] = None, status: Optional[str] = None, exam_type: Optional[str] = None, institute: Optional[str] = None, sort_by: str = "created_at", sort_order: str = "desc"):
        try:
            stmt = self._base()
            filters = []
            if status:
                filters.append(self.model_type.status == status)
            if exam_type:
                filters.append(self.model_type.exam_type == exam_type)
            if institute:
                filters.append(self.model_type.institute == institute)
            if query:
                search = f"%{query.strip().lower()}%"
                fields = [self.model_type.institute, self.model_type.exam_type]
                if self.model_type is ExamFormPreference:
                    fields.extend([self.model_type.academic_session, self.model_type.course, self.model_type.program, self.model_type.semester])
                elif self.model_type is ExamFormHeaderFooter:
                    fields.extend([self.model_type.header_name, self.model_type.header_html, self.model_type.footer_html])
                else:
                    fields.extend([
                        cast(self.model_type.academic_session_id, String),
                        cast(self.model_type.institute_id, String),
                        cast(self.model_type.course_id, String),
                        cast(self.model_type.program_id, String),
                        cast(self.model_type.semester_id, String),
                        cast(self.model_type.exam_type_id, String),
                        self.model_type.status,
                    ])
                filters.append(or_(*[field.ilike(search) for field in fields]))
            if filters:
                stmt = stmt.where(*filters)
            total_stmt = select(func.count(self.model_type.id))
            if hasattr(self.model_type, "deleted_at"):
                total_stmt = total_stmt.where(self.model_type.deleted_at.is_(None))
            if filters:
                total_stmt = total_stmt.where(*filters)
            total_result = await self._execute(total_stmt)
            total = int(total_result.scalar_one() or 0)
            sort_field = getattr(self.model_type, sort_by, self.model_type.created_at)
            stmt = stmt.order_by(sort_field.asc() if sort_order.lower() == "asc" else sort_field.desc()).offset((page - 1) * page_size).limit(page_size)
            result = await self._execute(stmt)
            return list(result.scalars().all()), total
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_active(self, entity_id: int):
        try:
            result = await self._execute(self._base().where(self.model_type.id == entity_id))
            return result.scalars().first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_by_combination(self, values: dict[str, Any], exclude_id: Optional[int] = None):
        try:
            conditions = [getattr(self.model_type, key) == value for key, value in values.items()]
            stmt = self._base().where(*conditions)
            if exclude_id is not None:
                stmt = stmt.where(self.model_type.id != exclude_id)
            result = await self._execute(stmt)
            return result.scalars().first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def soft_delete(self, entity_id: int) -> bool:
        entity = await self.get_active(entity_id)
        if entity is None:
            return False
        if not hasattr(self.model_type, "deleted_at"):
            await self._delete(entity)
            await self._commit()
            return True
        entity.deleted_at = datetime.utcnow()
        entity.updated_at = datetime.utcnow()
        await self._commit()
        return True


class MySQLExamFormPreferenceRepository(ExamFormRepository):
    def __init__(self, session):
        super().__init__(session, ExamFormPreference)


class MySQLExamFormHeaderFooterRepository(ExamFormRepository):
    def __init__(self, session):
        super().__init__(session, ExamFormHeaderFooter)


class MySQLCoeExamFormPreferenceRepository(ExamFormRepository):
    def __init__(self, session):
        super().__init__(session, CoeExamFormPreference)
