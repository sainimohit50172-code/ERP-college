from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.hostel import HostelAllocation, Room
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.hostel import HostelRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLHostelRepository(MySQLRepository[Room], HostelRepository):
    def __init__(self, session):
        super().__init__(session, Room)

    async def assign_room(self, student_id: int, room_id: int) -> HostelAllocation:
        allocation = HostelAllocation(student_id=student_id, bed_id=1, start_date=None)
        self.session.add(allocation)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(allocation))
        return allocation

    async def release_room(self, allocation_id: int) -> bool:
        return True
