from app.api.v1.shared.dependencies import (
    get_other_income_account_mapper_repository,
    get_other_income_account_mapper_service,
)
from app.api.v1.shared.router_factory import build_crud_router
from app.models.finance import OtherIncomeAccountMapper
from app.schemas.finance.schemas import (
    OtherIncomeAccountMapperCreate,
    OtherIncomeAccountMapperDetail,
    OtherIncomeAccountMapperListItem,
    OtherIncomeAccountMapperUpdate,
)


class OtherIncomeAccountMapperBulkUpdate(OtherIncomeAccountMapperUpdate):
    id: int


router = build_crud_router(
    prefix="/other-income-account-mappers",
    tags=["other-income-account-mappers"],
    repository_dependency=get_other_income_account_mapper_repository,
    service_dependency=get_other_income_account_mapper_service,
    model_class=OtherIncomeAccountMapper,
    create_schema=OtherIncomeAccountMapperCreate,
    update_schema=OtherIncomeAccountMapperUpdate,
    detail_schema=OtherIncomeAccountMapperDetail,
    list_schema=OtherIncomeAccountMapperListItem,
    bulk_update_schema=OtherIncomeAccountMapperBulkUpdate,
    entity_name="other income account mapper",
)
