from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_hostel_repository, get_hostel_service
from app.models.hostel import Hostel
from app.schemas.hostel.schemas import HostelCreate, HostelDetail, HostelListItem, HostelUpdate


class HostelBulkUpdate(HostelUpdate):
    id: int


router = build_crud_router(
    prefix="/hostel",
    tags=["hostel"],
    repository_dependency=get_hostel_repository,
    service_dependency=get_hostel_service,
    model_class=Hostel,
    create_schema=HostelCreate,
    update_schema=HostelUpdate,
    detail_schema=HostelDetail,
    list_schema=HostelListItem,
    bulk_update_schema=HostelBulkUpdate,
)
