from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.audit import AuditLog
from app.repositories.interfaces.base import BaseRepository


class AuditRepository(BaseRepository[AuditLog], ABC):
    @abstractmethod
    async def log_action(self, actor_id: int, action: str, entity_type: str, entity_id: int) -> AuditLog:
        raise NotImplementedError

    @abstractmethod
    async def query_by_actor(self, actor_id: int) -> list[AuditLog]:
        raise NotImplementedError
