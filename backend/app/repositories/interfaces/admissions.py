from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.admissions import Admission
from app.repositories.interfaces.base import BaseRepository


class AdmissionRepository(BaseRepository[Admission], ABC):
    @abstractmethod
    async def find_by_application_no(self, application_no: str) -> Optional[Admission]:
        raise NotImplementedError

    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[Admission]:
        raise NotImplementedError
