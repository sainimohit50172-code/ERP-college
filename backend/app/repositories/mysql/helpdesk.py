from app.models.helpdesk import Ticket, TicketAttachment
from app.repositories.interfaces.helpdesk import (
    HelpdeskTicketAttachmentRepository,
    HelpdeskTicketRepository,
)
from app.repositories.mysql.base import MySQLRepository


class MySQLTicketRepository(MySQLRepository[Ticket], HelpdeskTicketRepository):
    def __init__(self, session):
        super().__init__(session, Ticket)


class MySQLTicketAttachmentRepository(MySQLRepository[TicketAttachment], HelpdeskTicketAttachmentRepository):
    def __init__(self, session):
        super().__init__(session, TicketAttachment)
