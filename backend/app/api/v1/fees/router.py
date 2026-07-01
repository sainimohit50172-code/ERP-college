from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_fee_repository, get_fee_service
from app.models.finance import FeeCollection
from app.schemas.fees.schemas import FeeCollectionCreate, FeeCollectionDetail, FeeCollectionListItem, FeeCollectionUpdate


class FeeCollectionBulkUpdate(FeeCollectionUpdate):
    id: int


router = build_crud_router(
    prefix="/fees",
    tags=["fees"],
    repository_dependency=get_fee_repository,
    service_dependency=get_fee_service,
    model_class=FeeCollection,
    create_schema=FeeCollectionCreate,
    update_schema=FeeCollectionUpdate,
    detail_schema=FeeCollectionDetail,
    list_schema=FeeCollectionListItem,
    bulk_update_schema=FeeCollectionBulkUpdate,
)
