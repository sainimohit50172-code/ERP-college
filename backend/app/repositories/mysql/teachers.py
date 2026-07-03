from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.teachers import Teacher
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.teachers import TeacherRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLTeacherRepository(MySQLRepository[Teacher], TeacherRepository):
    def __init__(self, session):
        super().__init__(session, Teacher)

    async def find_by_employee_id(self, employee_id: int) -> Optional[Teacher]:
        try:
            stmt = select(Teacher).where(Teacher.employee_id == employee_id)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def find_by_teacher_code(self, teacher_code: str) -> Optional[Teacher]:
        try:
            stmt = select(Teacher).where(Teacher.teacher_code == teacher_code)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc
