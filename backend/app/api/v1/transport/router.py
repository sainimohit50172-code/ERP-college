from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_transport_repository,
    get_transport_service,
    get_transport_entity_repository,
    get_route_repository,
    get_transport_assignment_repository,
    get_transport_entity_service,
    get_route_service,
    get_transport_assignment_service,
)
from app.models.transport import Vehicle, Route, TransportAssignment
from app.schemas.transport.schemas import (
    VehicleCreate,
    VehicleDetail,
    VehicleListItem,
    VehicleUpdate,
    RouteCreate,
    RouteDetail,
    RouteListItem,
    RouteUpdate,
    TransportAssignmentCreate,
    TransportAssignmentDetail,
    TransportAssignmentListItem,
    TransportAssignmentUpdate,
)


class VehicleBulkUpdate(VehicleUpdate):
    id: int


class RouteBulkUpdate(RouteUpdate):
    id: int


class TransportAssignmentBulkUpdate(TransportAssignmentUpdate):
    id: int


# Parent router for transports
router = build_crud_router(
    prefix="/transports",
    tags=["transports"],
    repository_dependency=get_transport_entity_repository,
    service_dependency=get_transport_entity_service,
    model_class=Vehicle,
    create_schema=VehicleCreate,
    update_schema=VehicleUpdate,
    detail_schema=VehicleDetail,
    list_schema=VehicleListItem,
    bulk_update_schema=VehicleBulkUpdate,
)


# Sub-routers
vehicle_router = build_crud_router(
    prefix="/transport-vehicles",
    tags=["transport-vehicles"],
    repository_dependency=get_transport_repository,
    service_dependency=get_transport_service,
    model_class=Vehicle,
    create_schema=VehicleCreate,
    update_schema=VehicleUpdate,
    detail_schema=VehicleDetail,
    list_schema=VehicleListItem,
    bulk_update_schema=VehicleBulkUpdate,
)

route_router = build_crud_router(
    prefix="/transport-routes",
    tags=["transport-routes"],
    repository_dependency=get_route_repository,
    service_dependency=get_route_service,
    model_class=Route,
    create_schema=RouteCreate,
    update_schema=RouteUpdate,
    detail_schema=RouteDetail,
    list_schema=RouteListItem,
    bulk_update_schema=RouteBulkUpdate,
)

assignment_router = build_crud_router(
    prefix="/student-transport-assignments",
    tags=["student-transport-assignments"],
    repository_dependency=get_transport_assignment_repository,
    service_dependency=get_transport_assignment_service,
    model_class=TransportAssignment,
    create_schema=TransportAssignmentCreate,
    update_schema=TransportAssignmentUpdate,
    detail_schema=TransportAssignmentDetail,
    list_schema=TransportAssignmentListItem,
    bulk_update_schema=TransportAssignmentBulkUpdate,
)

for r in [vehicle_router, route_router, assignment_router]:
    router.include_router(r)
