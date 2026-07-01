from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.employees import EmployeeRepository


class EmployeeServiceError(Exception):
    """Raised when employee lifecycle operations fail."""


@dataclass(slots=True)
class EmployeeDTO:
    id: Optional[int]
    employee_code: str
    first_name: str
    last_name: Optional[str]
    status: str


class EmployeeService:
    def __init__(self, employee_repository: EmployeeRepository) -> None:
        self._employee_repository = employee_repository

    async def join_employee(self, employee_code: str, first_name: str, last_name: Optional[str], status: str = "Active") -> EmployeeDTO:
        if not employee_code.strip():
            raise EmployeeServiceError("Employee code is required")

        return EmployeeDTO(id=None, employee_code=employee_code, first_name=first_name, last_name=last_name, status=status)
