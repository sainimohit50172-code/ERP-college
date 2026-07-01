from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_notification_repository, get_notification_service
from app.models.notifications import Notification
from app.schemas.notifications.schemas import NotificationCreate, NotificationDetail, NotificationListItem, NotificationUpdate


class NotificationBulkUpdate(NotificationUpdate):
    id: int


router = build_crud_router(
    prefix="/notifications",
    tags=["notifications"],
    repository_dependency=get_notification_repository,
    service_dependency=get_notification_service,
    model_class=Notification,
    create_schema=NotificationCreate,
    update_schema=NotificationUpdate,
    detail_schema=NotificationDetail,
    list_schema=NotificationListItem,
    bulk_update_schema=NotificationBulkUpdate,
)
