from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_examination_repository, get_examination_service
from app.models.examinations import Exam
from app.schemas.examinations.schemas import ExamCreate, ExamDetail, ExamListItem, ExamUpdate


class ExamBulkUpdate(ExamUpdate):
    id: int


router = build_crud_router(
    prefix="/examinations",
    tags=["examinations"],
    repository_dependency=get_examination_repository,
    service_dependency=get_examination_service,
    model_class=Exam,
    create_schema=ExamCreate,
    update_schema=ExamUpdate,
    detail_schema=ExamDetail,
    list_schema=ExamListItem,
    bulk_update_schema=ExamBulkUpdate,
)
