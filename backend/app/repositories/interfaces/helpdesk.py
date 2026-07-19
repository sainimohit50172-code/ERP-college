from __future__ import annotations

from abc import ABC
from typing import Generic

from app.models.helpdesk import Ticket, TicketAttachment
from app.repositories.interfaces.base import BaseRepository


class HelpdeskTicketRepository(BaseRepository[Ticket], ABC):
    pass


class HelpdeskTicketAttachmentRepository(BaseRepository[TicketAttachment], ABC):
    pass
