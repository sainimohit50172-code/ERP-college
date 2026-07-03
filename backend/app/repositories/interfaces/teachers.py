from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.teachers import Teacher
from app.repositories.interfaces.base import BaseRepository


class TeacherRepository(BaseRepository[Teacher], ABC):
    @abstractmethod
    async def find_by_employee_id(self, employee_id: int) -> Optional[Teacher]:
        raise NotImplementedError

    @abstractmethod
    async def find_by_teacher_code(self, teacher_code: str) -> Optional[Teacher]:
        raise NotImplementedError
