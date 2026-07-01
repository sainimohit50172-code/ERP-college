from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_auth_repository, get_auth_service
from app.models.auth import User
from app.schemas.auth.schemas import UserCreate, UserDetail, UserListItem, UserUpdate


class UserBulkUpdate(UserUpdate):
    id: int


router = build_crud_router(
    prefix="/auth",
    tags=["auth"],
    repository_dependency=get_auth_repository,
    service_dependency=get_auth_service,
    model_class=User,
    create_schema=UserCreate,
    update_schema=UserUpdate,
    detail_schema=UserDetail,
    list_schema=UserListItem,
    bulk_update_schema=UserBulkUpdate,
)
