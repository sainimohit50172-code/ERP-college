from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.students import Student
from app.repositories.interfaces.base import BaseRepository


class StudentRepository(BaseRepository[Student], ABC):
    @abstractmethod
    async def find_by_roll_number(self, roll_number: str) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def find_by_admission_no(self, admission_no: str) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
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
        raise NotImplementedError
