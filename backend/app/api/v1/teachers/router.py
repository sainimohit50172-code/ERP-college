from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_teacher_repository, get_teacher_service
from app.models.teachers import Teacher
from app.schemas.teachers.schemas import TeacherCreate, TeacherDetail, TeacherListItem, TeacherUpdate


router = build_crud_router(
    prefix="/teachers",
    tags=["teachers"],
    repository_dependency=get_teacher_repository,
    service_dependency=get_teacher_service,
    model_class=Teacher,
    create_schema=TeacherCreate,
    update_schema=TeacherUpdate,
    detail_schema=TeacherDetail,
    list_schema=TeacherListItem,
    bulk_update_schema=TeacherUpdate,
)

# expose dependency functions for tests and external overrides
router.get_teacher_repository = get_teacher_repository
router.get_teacher_service = get_teacher_service
