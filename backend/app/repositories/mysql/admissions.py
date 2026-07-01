from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.admissions import Admission
from app.repositories.interfaces.admissions import AdmissionRepository
from app.repositories.interfaces.base import RepositoryError
from app.repositories.mysql.base import MySQLRepository


class MySQLAdmissionRepository(MySQLRepository[Admission], AdmissionRepository):
    def __init__(self, session):
        super().__init__(session, Admission)

    async def find_by_application_no(self, application_no: str) -> Optional[Admission]:
        try:
            stmt = select(Admission).where(Admission.id == int(application_no))
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except (ValueError, SQLAlchemyError) as exc:
            raise RepositoryError(str(exc)) from exc

    async def find_by_email(self, email: str) -> Optional[Admission]:
        try:
            stmt = select(Admission).where(Admission.email == email)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc
