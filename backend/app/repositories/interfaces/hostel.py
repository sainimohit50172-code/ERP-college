from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.hostel import HostelAllocation, Room
from app.repositories.interfaces.base import BaseRepository


class HostelRepository(BaseRepository[Room], ABC):
    @abstractmethod
    async def assign_room(self, student_id: int, room_id: int) -> HostelAllocation:
        raise NotImplementedError

    @abstractmethod
    async def release_room(self, allocation_id: int) -> bool:
        raise NotImplementedError
