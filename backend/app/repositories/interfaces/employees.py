from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.employees import Employee
from app.repositories.interfaces.base import BaseRepository


class EmployeeRepository(BaseRepository[Employee], ABC):
    @abstractmethod
    async def find_by_employee_code(self, employee_code: str) -> Optional[Employee]:
        raise NotImplementedError

    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[Employee]:
        raise NotImplementedError
