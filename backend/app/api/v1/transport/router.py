from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_transport_repository, get_transport_service
from app.models.transport import Vehicle
from app.schemas.transport.schemas import VehicleCreate, VehicleDetail, VehicleListItem, VehicleUpdate


class VehicleBulkUpdate(VehicleUpdate):
    id: int


router = build_crud_router(
    prefix="/transport",
    tags=["transport"],
    repository_dependency=get_transport_repository,
    service_dependency=get_transport_service,
    model_class=Vehicle,
    create_schema=VehicleCreate,
    update_schema=VehicleUpdate,
    detail_schema=VehicleDetail,
    list_schema=VehicleListItem,
    bulk_update_schema=VehicleBulkUpdate,
)
