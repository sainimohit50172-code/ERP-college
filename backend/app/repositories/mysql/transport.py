from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.transport import TransportAssignment, Vehicle
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.transport import TransportRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLTransportRepository(MySQLRepository[Vehicle], TransportRepository):
    def __init__(self, session):
        super().__init__(session, Vehicle)

    async def assigned_vehicle(self, student_id: int) -> list[TransportAssignment]:
        try:
            stmt = select(TransportAssignment).where(TransportAssignment.vehicle_id == student_id)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def assigned_driver(self, vehicle_id: int) -> list[TransportAssignment]:
        try:
            stmt = select(TransportAssignment).where(TransportAssignment.vehicle_id == vehicle_id)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def assign_vehicle(self, student_id: int, vehicle_id: int) -> TransportAssignment:
        assignment = TransportAssignment(vehicle_id=vehicle_id, route_id=1, assigned_to=student_id)
        self.session.add(assignment)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(assignment))
        return assignment

    async def assign_driver(self, vehicle_id: int, driver_id: int) -> Vehicle:
        vehicle = await self.get_by_id(vehicle_id)
        if vehicle is None:
            raise RepositoryError("Vehicle not found")
        return vehicle
