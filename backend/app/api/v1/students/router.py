from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_student_repository, get_student_service
from app.models.students import Student
from app.schemas.students.schemas import StudentCreate, StudentDetail, StudentListItem, StudentUpdate


class StudentBulkUpdate(StudentUpdate):
    id: int


router = build_crud_router(
    prefix="/students",
    tags=["students"],
    repository_dependency=get_student_repository,
    service_dependency=get_student_service,
    model_class=Student,
    create_schema=StudentCreate,
    update_schema=StudentUpdate,
    detail_schema=StudentDetail,
    list_schema=StudentListItem,
    bulk_update_schema=StudentBulkUpdate,
)
