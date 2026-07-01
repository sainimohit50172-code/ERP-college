from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_admission_repository, get_admission_service
from app.models.admissions import Admission
from app.schemas.admissions.schemas import AdmissionCreate, AdmissionDetail, AdmissionListItem, AdmissionUpdate


class AdmissionBulkUpdate(AdmissionUpdate):
    id: int


router = build_crud_router(
    prefix="/admissions",
    tags=["admissions"],
    repository_dependency=get_admission_repository,
    service_dependency=get_admission_service,
    model_class=Admission,
    create_schema=AdmissionCreate,
    update_schema=AdmissionUpdate,
    detail_schema=AdmissionDetail,
    list_schema=AdmissionListItem,
    bulk_update_schema=AdmissionBulkUpdate,
)
