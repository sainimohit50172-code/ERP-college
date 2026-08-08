from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_admission_category_repository,
    get_admission_category_service,
    get_admission_repository,
    get_admission_service,
)
from app.models.admissions import Admission, AdmissionCategory
from app.schemas.admissions.schemas import AdmissionCreate, AdmissionDetail, AdmissionListItem, AdmissionUpdate
from app.schemas.admissions.category_schemas import (
    AdmissionCategoryCreate,
    AdmissionCategoryDetail,
    AdmissionCategoryListItem,
    AdmissionCategoryResponse,
    AdmissionCategoryUpdate,
)


class AdmissionBulkUpdate(AdmissionUpdate):
    id: int


class AdmissionCategoryBulkUpdate(AdmissionCategoryUpdate):
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

admission_categories_router = build_crud_router(
    prefix="/admission-categories",
    tags=["admission-categories"],
    repository_dependency=get_admission_category_repository,
    service_dependency=get_admission_category_service,
    model_class=AdmissionCategory,
    create_schema=AdmissionCategoryCreate,
    update_schema=AdmissionCategoryUpdate,
    detail_schema=AdmissionCategoryDetail,
    list_schema=AdmissionCategoryListItem,
    bulk_update_schema=AdmissionCategoryBulkUpdate,
)
