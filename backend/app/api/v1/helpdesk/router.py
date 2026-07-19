from fastapi import APIRouter

from app.api.v1.shared.dependencies import (
    get_helpdesk_ticket_attachment_repository,
    get_helpdesk_ticket_attachment_service,
    get_helpdesk_ticket_repository,
    get_helpdesk_ticket_service,
)
from app.api.v1.shared.router_factory import build_crud_router
from app.models.helpdesk import Ticket, TicketAttachment
from app.schemas.helpdesk.schemas import (
    TicketAttachmentCreate,
    TicketAttachmentDetail,
    TicketAttachmentListItem,
    TicketAttachmentUpdate,
    TicketCreate,
    TicketDetail,
    TicketListItem,
    TicketUpdate,
)


class TicketBulkUpdate(TicketUpdate):
    id: int


class TicketAttachmentBulkUpdate(TicketAttachmentUpdate):
    id: int


router = APIRouter(prefix="/helpdesk", tags=["helpdesk"])

tickets_router = build_crud_router(
    prefix="/tickets",
    tags=["helpdesk-tickets"],
    repository_dependency=get_helpdesk_ticket_repository,
    service_dependency=get_helpdesk_ticket_service,
    model_class=Ticket,
    create_schema=TicketCreate,
    update_schema=TicketUpdate,
    detail_schema=TicketDetail,
    list_schema=TicketListItem,
    bulk_update_schema=TicketBulkUpdate,
)

attachments_router = build_crud_router(
    prefix="/attachments",
    tags=["helpdesk-attachments"],
    repository_dependency=get_helpdesk_ticket_attachment_repository,
    service_dependency=get_helpdesk_ticket_attachment_service,
    model_class=TicketAttachment,
    create_schema=TicketAttachmentCreate,
    update_schema=TicketAttachmentUpdate,
    detail_schema=TicketAttachmentDetail,
    list_schema=TicketAttachmentListItem,
    bulk_update_schema=TicketAttachmentBulkUpdate,
)

router.include_router(tickets_router)
router.include_router(attachments_router)
