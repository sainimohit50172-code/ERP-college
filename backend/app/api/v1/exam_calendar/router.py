from __future__ import annotations

from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_exam_calendar_repository,
    get_exam_calendar_service,
)
from app.models.exam_calendar import ExamCalendar
from app.schemas.exam_calendar.schemas import (
    ExamCalendarCreate,
    ExamCalendarDetail,
    ExamCalendarListItem,
    ExamCalendarUpdate,
)


class ExamCalendarBulkUpdate(ExamCalendarUpdate):
    id: int


router = build_crud_router(
    prefix="/exam-calendars",
    tags=["exam-calendars"],
    repository_dependency=get_exam_calendar_repository,
    service_dependency=get_exam_calendar_service,
    model_class=ExamCalendar,
    create_schema=ExamCalendarCreate,
    update_schema=ExamCalendarUpdate,
    detail_schema=ExamCalendarDetail,
    list_schema=ExamCalendarListItem,
    bulk_update_schema=ExamCalendarBulkUpdate,
)
