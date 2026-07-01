from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.students import Student
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.students import StudentRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLStudentRepository(MySQLRepository[Student], StudentRepository):
    def __init__(self, session):
        super().__init__(session, Student)

    async def find_by_roll_number(self, roll_number: str) -> Optional[Student]:
        try:
            stmt = select(Student).where(Student.admission_no == roll_number)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def find_by_admission_no(self, admission_no: str) -> Optional[Student]:
        try:
            stmt = select(Student).where(Student.admission_no == admission_no)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def find_by_email(self, email: str) -> Optional[Student]:
        try:
            stmt = select(Student).where(Student.contact.isnot(None))
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc
