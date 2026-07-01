from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_procurement_repository, get_procurement_service
from app.models.procurement import PurchaseRequest
from app.schemas.procurement.schemas import PurchaseRequestCreate, PurchaseRequestDetail, PurchaseRequestListItem, PurchaseRequestUpdate


class PurchaseRequestBulkUpdate(PurchaseRequestUpdate):
    id: int


router = build_crud_router(
    prefix="/procurement",
    tags=["procurement"],
    repository_dependency=get_procurement_repository,
    service_dependency=get_procurement_service,
    model_class=PurchaseRequest,
    create_schema=PurchaseRequestCreate,
    update_schema=PurchaseRequestUpdate,
    detail_schema=PurchaseRequestDetail,
    list_schema=PurchaseRequestListItem,
    bulk_update_schema=PurchaseRequestBulkUpdate,
)
