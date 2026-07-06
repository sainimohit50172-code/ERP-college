from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_hostel_repository,
    get_hostel_service,
    get_hostel_entity_repository,
    get_room_repository,
    get_bed_repository,
    get_hostel_allocation_repository,
    get_complaint_repository,
    get_visitor_repository,
    get_hostel_entity_service,
    get_room_service,
    get_bed_service,
    get_hostel_allocation_service,
    get_complaint_service,
    get_visitor_service,
)
from app.models.hostel import Hostel, Room, Bed, HostelAllocation, Complaint, Visitor
from app.schemas.hostel.schemas import (
    HostelCreate,
    HostelDetail,
    HostelListItem,
    HostelUpdate,
    RoomCreate,
    RoomDetail,
    RoomListItem,
    RoomUpdate,
    BedCreate,
    BedDetail,
    BedListItem,
    BedUpdate,
    HostelAllocationCreate,
    HostelAllocationDetail,
    HostelAllocationListItem,
    HostelAllocationUpdate,
    ComplaintCreate,
    ComplaintDetail,
    ComplaintListItem,
    ComplaintUpdate,
    VisitorCreate,
    VisitorDetail,
    VisitorListItem,
    VisitorUpdate,
)


class HostelBulkUpdate(HostelUpdate):
    id: int


class RoomBulkUpdate(RoomUpdate):
    id: int


class BedBulkUpdate(BedUpdate):
    id: int


class HostelAllocationBulkUpdate(HostelAllocationUpdate):
    id: int


class ComplaintBulkUpdate(ComplaintUpdate):
    id: int


class VisitorBulkUpdate(VisitorUpdate):
    id: int


# Parent router that aggregates all hostel-related routers
router = build_crud_router(
    prefix="/hostels",
    tags=["hostels"],
    repository_dependency=get_hostel_entity_repository,
    service_dependency=get_hostel_entity_service,
    model_class=Hostel,
    create_schema=HostelCreate,
    update_schema=HostelUpdate,
    detail_schema=HostelDetail,
    list_schema=HostelListItem,
    bulk_update_schema=HostelBulkUpdate,
)

# Create sub-routers for rooms, beds, allocations, complaints and visitors
room_router = build_crud_router(
    prefix="/hostel-rooms",
    tags=["hostel-rooms"],
    repository_dependency=get_room_repository,
    service_dependency=get_room_service,
    model_class=Room,
    create_schema=RoomCreate,
    update_schema=RoomUpdate,
    detail_schema=RoomDetail,
    list_schema=RoomListItem,
    bulk_update_schema=RoomBulkUpdate,
)

bed_router = build_crud_router(
    prefix="/hostel-beds",
    tags=["hostel-beds"],
    repository_dependency=get_bed_repository,
    service_dependency=get_bed_service,
    model_class=Bed,
    create_schema=BedCreate,
    update_schema=BedUpdate,
    detail_schema=BedDetail,
    list_schema=BedListItem,
    bulk_update_schema=BedBulkUpdate,
)

allocation_router = build_crud_router(
    prefix="/hostel-allocations",
    tags=["hostel-allocations"],
    repository_dependency=get_hostel_allocation_repository,
    service_dependency=get_hostel_allocation_service,
    model_class=HostelAllocation,
    create_schema=HostelAllocationCreate,
    update_schema=HostelAllocationUpdate,
    detail_schema=HostelAllocationDetail,
    list_schema=HostelAllocationListItem,
    bulk_update_schema=HostelAllocationBulkUpdate,
)

complaint_router = build_crud_router(
    prefix="/hostel-complaints",
    tags=["hostel-complaints"],
    repository_dependency=get_complaint_repository,
    service_dependency=get_complaint_service,
    model_class=Complaint,
    create_schema=ComplaintCreate,
    update_schema=ComplaintUpdate,
    detail_schema=ComplaintDetail,
    list_schema=ComplaintListItem,
    bulk_update_schema=ComplaintBulkUpdate,
)

visitor_router = build_crud_router(
    prefix="/hostel-visitors",
    tags=["hostel-visitors"],
    repository_dependency=get_visitor_repository,
    service_dependency=get_visitor_service,
    model_class=Visitor,
    create_schema=VisitorCreate,
    update_schema=VisitorUpdate,
    detail_schema=VisitorDetail,
    list_schema=VisitorListItem,
    bulk_update_schema=VisitorBulkUpdate,
)

# Include sub-routers under the parent router so main.py needs no changes
for r in [room_router, bed_router, allocation_router, complaint_router, visitor_router]:
    router.include_router(r)
