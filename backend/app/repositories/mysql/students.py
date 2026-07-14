from __future__ import annotations

from typing import Optional

from sqlalchemy import delete, func, or_, select
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

    async def list_students(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        filter_field: str | None = None,
        filter_value: str | None = None,
        filter_operator: str = "eq",
        sort_by: str | None = None,
        sort_order: str = "asc",
    ) -> tuple[list[Student], int]:
        try:
            stmt = select(Student)
            count_stmt = select(func.count(Student.id))
            conditions = []

            def _json_contact_field(path: str):
                return func.json_unquote(func.json_extract(Student.contact, path))

            if search:
                search_value = f"%{search.lower()}%"
                email_expr = _json_contact_field("$.email")
                phone_expr = _json_contact_field("$.phone")
                conditions.append(
                    or_(
                        func.lower(Student.admission_no).like(search_value),
                        func.lower(Student.first_name).like(search_value),
                        func.lower(Student.last_name).like(search_value),
                        func.lower(email_expr).like(search_value),
                        func.lower(phone_expr).like(search_value),
                    )
                )

            field_map = {
                "admission_number": Student.admission_no,
                "date_of_birth": Student.dob,
                "first_name": Student.first_name,
                "last_name": Student.last_name,
                "status": Student.status,
                "email": _json_contact_field("$.email"),
                "phone": _json_contact_field("$.phone"),
            }

            if filter_field and filter_value is not None and filter_field in field_map:
                field_expr = field_map[filter_field]
                value = filter_value
                if filter_operator == "contains":
                    conditions.append(func.lower(field_expr).like(f"%{value.lower()}%"))
                elif filter_operator == "eq":
                    conditions.append(field_expr == value)
                elif filter_operator == "ne":
                    conditions.append(field_expr != value)
                elif filter_operator == "gt":
                    conditions.append(field_expr > value)
                elif filter_operator == "gte":
                    conditions.append(field_expr >= value)
                elif filter_operator == "lt":
                    conditions.append(field_expr < value)
                elif filter_operator == "lte":
                    conditions.append(field_expr <= value)

            if conditions:
                stmt = stmt.where(*conditions)
                count_stmt = count_stmt.where(*conditions)

            if sort_by:
                sort_map = {
                    "admission_number": Student.admission_no,
                    "date_of_birth": Student.dob,
                    "first_name": Student.first_name,
                    "last_name": Student.last_name,
                    "status": Student.status,
                    "email": _json_contact_field("$.email"),
                    "phone": _json_contact_field("$.phone"),
                }
                sort_expr = sort_map.get(sort_by, getattr(Student, sort_by, None))
                if sort_expr is not None:
                    order = sort_expr.desc() if sort_order == "desc" else sort_expr.asc()
                    stmt = stmt.order_by(order)

            total_result = await self._execute(count_stmt)
            total = int(total_result.scalar_one() or 0)

            stmt = stmt.offset((page - 1) * page_size).limit(page_size)
            result = await self._execute(stmt)
            return list(result.scalars().all()), total
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc
