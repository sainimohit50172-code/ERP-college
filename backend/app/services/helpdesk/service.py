from __future__ import annotations

import random
from datetime import datetime
from typing import Any, Iterable

from app.models.helpdesk import Ticket, TicketAttachment
from app.repositories.interfaces.helpdesk import HelpdeskTicketAttachmentRepository, HelpdeskTicketRepository


class HelpdeskServiceError(Exception):
    pass


class TicketService:
    def __init__(
        self,
        ticket_repository: HelpdeskTicketRepository,
        attachment_repository: HelpdeskTicketAttachmentRepository,
    ) -> None:
        self._ticket_repository = ticket_repository
        self._attachment_repository = attachment_repository

    async def create_ticket(self, **payload: Any) -> Ticket:
        attachment_ids = payload.pop("attachment_ids", None)
        ticket_number = payload.get("ticket_number")
        if not ticket_number:
            payload["ticket_number"] = self._generate_ticket_number()
        if "status" not in payload or payload.get("status") is None:
            payload["status"] = "Open"

        ticket = Ticket(**payload)
        created_ticket = await self._ticket_repository.create(ticket)

        if attachment_ids:
            for attachment_id in self._normalize_attachment_ids(attachment_ids):
                await self._attach_file_to_ticket(attachment_id, created_ticket.id)

        return created_ticket

    async def create_request(self, **payload: Any) -> dict[str, Any]:
        if "ticket_number" not in payload or not payload.get("ticket_number"):
            payload["ticket_number"] = self._generate_ticket_number()
        if "status" not in payload or payload.get("status") is None:
            payload["status"] = "Open"
        return payload

    async def _attach_file_to_ticket(self, attachment_id: int, ticket_id: int) -> None:
        existing = await self._attachment_repository.get_by_id(attachment_id)
        if existing is None:
            return
        existing.ticket_id = ticket_id
        await self._attachment_repository.update(attachment_id, existing)

    def _normalize_attachment_ids(self, attachment_ids: Any) -> list[int]:
        if isinstance(attachment_ids, str):
            return [int(value) for value in attachment_ids.split(",") if value.isdigit()]
        if isinstance(attachment_ids, Iterable):
            return [int(value) for value in attachment_ids if isinstance(value, (int, str)) and str(value).isdigit()]
        return []

    def _generate_ticket_number(self) -> str:
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        suffix = random.randint(100, 999)
        return f"TKT-{timestamp}-{suffix}"


class TicketAttachmentService:
    def __init__(self, attachment_repository: HelpdeskTicketAttachmentRepository) -> None:
        self._attachment_repository = attachment_repository
