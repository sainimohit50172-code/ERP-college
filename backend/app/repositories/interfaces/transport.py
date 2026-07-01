from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.transport import TransportAssignment, Vehicle
from app.repositories.interfaces.base import BaseRepository


class TransportRepository(BaseRepository[Vehicle], ABC):
    @abstractmethod
    async def assign_vehicle(self, student_id: int, vehicle_id: int) -> TransportAssignment:
        raise NotImplementedError

    @abstractmethod
    async def assign_driver(self, vehicle_id: int, driver_id: int) -> Vehicle:
        raise NotImplementedError
