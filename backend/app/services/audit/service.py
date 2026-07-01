from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.audit import AuditRepository


class AuditServiceError(Exception):
    """Raised when audit recording operations fail."""


@dataclass(slots=True)
class AuditRecordDTO:
    record_id: Optional[int]
    actor_id: Optional[int]
    action: str
    entity_type: str


class AuditService:
    def __init__(self, audit_repository: AuditRepository) -> None:
        self._audit_repository = audit_repository

    async def record(self, action: str, entity_type: str, actor_id: Optional[int] = None) -> AuditRecordDTO:
        if not action.strip() or not entity_type.strip():
            raise AuditServiceError("Action and entity type are required")

        return AuditRecordDTO(record_id=None, actor_id=actor_id, action=action, entity_type=entity_type)
