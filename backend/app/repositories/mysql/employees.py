from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.employees import Employee
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.employees import EmployeeRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLEmployeeRepository(MySQLRepository[Employee], EmployeeRepository):
    def __init__(self, session):
        super().__init__(session, Employee)

    async def find_by_employee_code(self, employee_code: str) -> Optional[Employee]:
        try:
            stmt = select(Employee).where(Employee.employee_no == employee_code)
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def find_by_email(self, email: str) -> Optional[Employee]:
        try:
            stmt = select(Employee).where(Employee.user_id.isnot(None))
            return await self._run_sync(lambda: self.session.scalars(stmt).first())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc
