from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_inventory_repository, get_inventory_service
from app.models.inventory import InventoryItem
from app.schemas.inventory.schemas import InventoryItemCreate, InventoryItemDetail, InventoryItemListItem, InventoryItemUpdate


class InventoryItemBulkUpdate(InventoryItemUpdate):
    id: int


router = build_crud_router(
    prefix="/inventory",
    tags=["inventory"],
    repository_dependency=get_inventory_repository,
    service_dependency=get_inventory_service,
    model_class=InventoryItem,
    create_schema=InventoryItemCreate,
    update_schema=InventoryItemUpdate,
    detail_schema=InventoryItemDetail,
    list_schema=InventoryItemListItem,
    bulk_update_schema=InventoryItemBulkUpdate,
)
