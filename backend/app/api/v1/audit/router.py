from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_audit_repository, get_audit_service
from app.models.audit import AuditLog
from app.schemas.audit.schemas import AuditLogCreate, AuditLogDetail, AuditLogListItem, AuditLogUpdate


class AuditLogBulkUpdate(AuditLogUpdate):
    id: int


router = build_crud_router(
    prefix="/audit",
    tags=["audit"],
    repository_dependency=get_audit_repository,
    service_dependency=get_audit_service,
    model_class=AuditLog,
    create_schema=AuditLogCreate,
    update_schema=AuditLogUpdate,
    detail_schema=AuditLogDetail,
    list_schema=AuditLogListItem,
    bulk_update_schema=AuditLogBulkUpdate,
)
