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
