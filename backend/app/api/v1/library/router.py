from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_library_repository, get_library_service
from app.models.library import LibraryItem
from app.schemas.library.schemas import LibraryItemCreate, LibraryItemDetail, LibraryItemListItem, LibraryItemUpdate


class LibraryItemBulkUpdate(LibraryItemUpdate):
    id: int


router = build_crud_router(
    prefix="/library",
    tags=["library"],
    repository_dependency=get_library_repository,
    service_dependency=get_library_service,
    model_class=LibraryItem,
    create_schema=LibraryItemCreate,
    update_schema=LibraryItemUpdate,
    detail_schema=LibraryItemDetail,
    list_schema=LibraryItemListItem,
    bulk_update_schema=LibraryItemBulkUpdate,
)
