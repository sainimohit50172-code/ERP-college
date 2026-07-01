from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.audit import AuditLog
from app.repositories.interfaces.audit import AuditRepository
from app.repositories.interfaces.base import RepositoryError
from app.repositories.mysql.base import MySQLRepository


class MySQLAuditRepository(MySQLRepository[AuditLog], AuditRepository):
    def __init__(self, session):
        super().__init__(session, AuditLog)

    async def audit_history(self) -> list[AuditLog]:
        try:
            stmt = select(AuditLog)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def log_action(self, actor_id: int, action: str, entity_type: str, entity_id: int) -> AuditLog:
        record = AuditLog(actor_id=actor_id, action=action, entity_type=entity_type, entity_id=entity_id)
        self.session.add(record)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(record))
        return record

    async def query_by_actor(self, actor_id: int) -> list[AuditLog]:
        return await self.audit_history()
