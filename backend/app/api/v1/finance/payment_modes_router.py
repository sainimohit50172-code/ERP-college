from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_payment_mode_repository, get_payment_mode_service
from app.models.finance import PaymentMode
from app.schemas.finance.schemas import (
    PaymentModeCreate,
    PaymentModeDetail,
    PaymentModeListItem,
    PaymentModeResponse,
    PaymentModeUpdate,
)

router = build_crud_router(
    prefix="/payment-modes",
    tags=["payment-modes"],
    repository_dependency=get_payment_mode_repository,
    service_dependency=get_payment_mode_service,
    model_class=PaymentMode,
    create_schema=PaymentModeCreate,
    update_schema=PaymentModeUpdate,
    detail_schema=PaymentModeDetail,
    list_schema=PaymentModeListItem,
    bulk_update_schema=PaymentModeUpdate,
    entity_name="payment mode",
)
