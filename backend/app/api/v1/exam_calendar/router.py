from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field

from app.api.v1.shared.dependencies import (
    get_exam_calendar_repository,
    get_exam_calendar_service,
)
from app.api.v1.shared.router_factory import build_crud_router
from app.models.exam_calendar import ExamCalendar
from app.schemas.exam_calendar.schemas import (
    ExamCalendarCreate,
    ExamCalendarDetail,
    ExamCalendarListItem,
    ExamCalendarUpdate,
)
from app.schemas.shared.base import APIResponse


class ExamCalendarBulkUpdate(ExamCalendarUpdate):
    id: int


class ExamCalendarBulkDeleteRequest(BaseModel):
    ids: list[int] = Field(min_length=1)
    reason: Optional[str] = None


def _register_extra_routes(router: APIRouter) -> None:
    @router.post(
        "/bulk-delete",
        response_model=APIResponse[dict[str, int]],
        summary="Bulk delete exam calendars",
        description="Delete multiple exam calendar records in bulk.",
    )
    async def bulk_delete_exam_calendars(
        payload: ExamCalendarBulkDeleteRequest,
        repository=Depends(get_exam_calendar_repository),
    ):
        deleted_count = await repository.bulk_delete(payload.ids)
        return APIResponse(data={"success_count": deleted_count}, message="Exam calendars deleted")

    @router.get(
        "/audit",
        response_model=APIResponse[dict[str, int]],
        summary="Exam calendar audit",
        description="Return audit summary statistics for exam calendars.",
    )
    async def audit_exam_calendars(
        repository=Depends(get_exam_calendar_repository),
    ):
        records = await repository.get_all(include_deleted=True)
        return APIResponse(data={"total": len(records)}, message="Exam calendar audit report")

    @router.get(
        "/stats",
        response_model=APIResponse[dict[str, int]],
        summary="Exam calendar stats",
        description="Return statistics for exam calendars.",
    )
    async def exam_calendar_stats(
        repository=Depends(get_exam_calendar_repository),
    ):
        total = await repository.count()
        return APIResponse(data={"totalExams": total}, message="Exam calendar stats")

    @router.get(
        "/export",
        summary="Export exam calendars",
        description="Export exam calendar records as CSV.",
    )
    async def export_exam_calendars(
        format: str = "csv",
        repository=Depends(get_exam_calendar_repository),
    ):
        records = await repository.get_all()
        if format.lower() != "csv":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported export format. Only 'csv' is supported.",
            )

        import csv
        import io

        fieldnames = [
            "exam_name",
            "academic_session",
            "exam_type",
            "exam_category",
            "status",
            "start_date",
            "end_date",
            "created_by",
            "created_date",
        ]
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for record in records:
            writer.writerow({key: getattr(record, key, None) for key in fieldnames})

        return PlainTextResponse(output.getvalue(), media_type="text/csv")


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
    extra_routes=_register_extra_routes,
)
