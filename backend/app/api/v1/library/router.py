from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_library_repository,
    get_library_service,
    get_library_entity_repository,
    get_book_copy_repository,
    get_book_issue_repository,
    get_reservation_repository,
    get_fine_repository,
    get_library_entity_service,
    get_book_copy_service,
    get_book_issue_service,
    get_reservation_service,
    get_fine_service,
)
from app.models.library import LibraryItem, BookCopy, BookIssue, Reservation, Fine
from app.schemas.library.schemas import (
    LibraryItemCreate,
    LibraryItemDetail,
    LibraryItemListItem,
    LibraryItemUpdate,
    BookCopyCreate,
    BookCopyDetail,
    BookCopyListItem,
    BookCopyUpdate,
    BookIssueCreate,
    BookIssueDetail,
    BookIssueListItem,
    BookIssueUpdate,
    ReservationCreate,
    ReservationDetail,
    ReservationListItem,
    ReservationUpdate,
    FineCreate,
    FineDetail,
    FineListItem,
    FineUpdate,
)


class LibraryItemBulkUpdate(LibraryItemUpdate):
    id: int


class BookCopyBulkUpdate(BookCopyUpdate):
    id: int


class BookIssueBulkUpdate(BookIssueUpdate):
    id: int


class ReservationBulkUpdate(ReservationUpdate):
    id: int


class FineBulkUpdate(FineUpdate):
    id: int


# Parent router that aggregates all library-related routers
router = build_crud_router(
    prefix="/libraries",
    tags=["libraries"],
    repository_dependency=get_library_entity_repository,
    service_dependency=get_library_entity_service,
    model_class=LibraryItem,
    create_schema=LibraryItemCreate,
    update_schema=LibraryItemUpdate,
    detail_schema=LibraryItemDetail,
    list_schema=LibraryItemListItem,
    bulk_update_schema=LibraryItemBulkUpdate,
)


# Sub-routers for books, copies, issues, reservations and fines
book_router = build_crud_router(
    prefix="/library-books",
    tags=["library-books"],
    repository_dependency=get_library_repository,
    service_dependency=get_library_service,
    model_class=LibraryItem,
    create_schema=LibraryItemCreate,
    update_schema=LibraryItemUpdate,
    detail_schema=LibraryItemDetail,
    list_schema=LibraryItemListItem,
    bulk_update_schema=LibraryItemBulkUpdate,
)

copy_router = build_crud_router(
    prefix="/library-copies",
    tags=["library-copies"],
    repository_dependency=get_book_copy_repository,
    service_dependency=get_book_copy_service,
    model_class=BookCopy,
    create_schema=BookCopyCreate,
    update_schema=BookCopyUpdate,
    detail_schema=BookCopyDetail,
    list_schema=BookCopyListItem,
    bulk_update_schema=BookCopyBulkUpdate,
)

issue_router = build_crud_router(
    prefix="/library-issues",
    tags=["library-issues"],
    repository_dependency=get_book_issue_repository,
    service_dependency=get_book_issue_service,
    model_class=BookIssue,
    create_schema=BookIssueCreate,
    update_schema=BookIssueUpdate,
    detail_schema=BookIssueDetail,
    list_schema=BookIssueListItem,
    bulk_update_schema=BookIssueBulkUpdate,
)

reservation_router = build_crud_router(
    prefix="/library-reservations",
    tags=["library-reservations"],
    repository_dependency=get_reservation_repository,
    service_dependency=get_reservation_service,
    model_class=Reservation,
    create_schema=ReservationCreate,
    update_schema=ReservationUpdate,
    detail_schema=ReservationDetail,
    list_schema=ReservationListItem,
    bulk_update_schema=ReservationBulkUpdate,
)

fine_router = build_crud_router(
    prefix="/library-fines",
    tags=["library-fines"],
    repository_dependency=get_fine_repository,
    service_dependency=get_fine_service,
    model_class=Fine,
    create_schema=FineCreate,
    update_schema=FineUpdate,
    detail_schema=FineDetail,
    list_schema=FineListItem,
    bulk_update_schema=FineBulkUpdate,
)


for r in [book_router, copy_router, issue_router, reservation_router, fine_router]:
    router.include_router(r)
