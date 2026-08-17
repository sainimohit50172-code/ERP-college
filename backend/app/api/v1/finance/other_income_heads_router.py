from app.api.v1.shared.dependencies import (
    get_other_income_head_repository,
    get_other_income_head_service,
)
from app.api.v1.shared.router_factory import build_crud_router
from app.models.finance import OtherIncomeHead
from app.schemas.finance.schemas import (
    OtherIncomeHeadCreate,
    OtherIncomeHeadDetail,
    OtherIncomeHeadListItem,
    OtherIncomeHeadUpdate,
)


class OtherIncomeHeadBulkUpdate(OtherIncomeHeadUpdate):
    id: int


router = build_crud_router(
    prefix="/other-income-heads",
    tags=["other-income-heads"],
    repository_dependency=get_other_income_head_repository,
    service_dependency=get_other_income_head_service,
    model_class=OtherIncomeHead,
    create_schema=OtherIncomeHeadCreate,
    update_schema=OtherIncomeHeadUpdate,
    detail_schema=OtherIncomeHeadDetail,
    list_schema=OtherIncomeHeadListItem,
    bulk_update_schema=OtherIncomeHeadBulkUpdate,
    entity_name="other income head",
)
