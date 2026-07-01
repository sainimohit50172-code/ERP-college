from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_finance_repository, get_finance_service
from app.models.finance import Account
from app.schemas.finance.schemas import AccountCreate, AccountDetail, AccountListItem, AccountUpdate


class AccountBulkUpdate(AccountUpdate):
    id: int


router = build_crud_router(
    prefix="/finance",
    tags=["finance"],
    repository_dependency=get_finance_repository,
    service_dependency=get_finance_service,
    model_class=Account,
    create_schema=AccountCreate,
    update_schema=AccountUpdate,
    detail_schema=AccountDetail,
    list_schema=AccountListItem,
    bulk_update_schema=AccountBulkUpdate,
)
