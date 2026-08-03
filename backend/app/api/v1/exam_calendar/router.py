from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import Response

from app.api.v1.shared.dependencies import get_exam_calendar_repository, get_exam_calendar_service
from app.schemas.exam_calendar.schemas import ExamCalendarCreate, ExamCalendarDetail, ExamCalendarListItem, ExamCalendarUpdate
from app.schemas.shared.base import APIResponse, PaginationRequest, PaginationResponse, SearchRequest, SearchResponse
from app.services.exam_calendar.service import ExamCalendarService, ExamCalendarServiceError

router = APIRouter(prefix="/exam-calendars", tags=["exam-calendars"])


@router.get(
    "/",
    response_model=APIResponse[PaginationResponse[ExamCalendarListItem]],
    summary="List exam calendars",
    description="List exam calendars with pagination, sorting, and filtering.",
)
async def list_exam_calendars(
    pagination: PaginationRequest = Depends(),
    academic_session: Optional[str] = Query(default=None),
    exam_type: Optional[str] = Query(default=None),
    exam_category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    created_by: Optional[str] = Query(default=None),
    updated_by: Optional[str] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    repository=Depends(get_exam_calendar_repository),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    items, total = await service.list_exam_calendars(
        page=pagination.page,
        page_size=pagination.page_size,
        sort_by=pagination.sort_by,
        sort_order=pagination.sort_order,
        academic_session=academic_session,
        exam_type=exam_type,
        exam_category=exam_category,
        status=status,
        created_by=created_by,
        updated_by=updated_by,
        start_date=start_date.isoformat() if start_date else None,
        end_date=end_date.isoformat() if end_date else None,
    )
    response = PaginationResponse[ExamCalendarListItem](
        items=[ExamCalendarListItem.model_validate(item) for item in items],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=(total + pagination.page_size - 1) // pagination.page_size,
    )
    return APIResponse(data=response)


@router.post(
    "/",
    response_model=APIResponse[ExamCalendarDetail],
    status_code=status.HTTP_201_CREATED,
    summary="Create exam calendar",
    description="Create a new exam calendar entry.",
)
async def create_exam_calendar(
    payload: ExamCalendarCreate,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "create":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    try:
        item = await service.create_exam_calendar(payload)
    except ExamCalendarServiceError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return APIResponse(data=ExamCalendarDetail.model_validate(item), message="Exam calendar created")


@router.get(
    "/search",
    response_model=APIResponse[SearchResponse[ExamCalendarListItem]],
    summary="Search exam calendars",
    description="Search exam calendars by text terms and optional filters.",
)
async def search_exam_calendars(
    q: Optional[str] = Query(default=None, alias="q"),
    academic_session: Optional[str] = Query(default=None),
    exam_type: Optional[str] = Query(default=None),
    exam_category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    created_by: Optional[str] = Query(default=None),
    updated_by: Optional[str] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    items = await service.search_exam_calendars(
        query=q or "",
        academic_session=academic_session,
        exam_type=exam_type,
        exam_category=exam_category,
        status=status,
        created_by=created_by,
        updated_by=updated_by,
        start_date=start_date.isoformat() if start_date else None,
        end_date=end_date.isoformat() if end_date else None,
    )
    response = SearchResponse[ExamCalendarListItem](
        items=[ExamCalendarListItem.model_validate(item) for item in items],
        total=len(items),
    )
    return APIResponse(data=response)


@router.post(
    "/search",
    response_model=APIResponse[SearchResponse[ExamCalendarListItem]],
    summary="Search exam calendars",
    description="Search exam calendars by the provided payload.",
)
async def search_exam_calendars_post(
    payload: SearchRequest,
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    items = await service.search_exam_calendars(query=payload.query)
    response = SearchResponse[ExamCalendarListItem](
        items=[ExamCalendarListItem.model_validate(item) for item in items],
        total=len(items),
    )
    return APIResponse(data=response)


@router.post(
    "/bulk-delete",
    response_model=APIResponse[dict],
    summary="Bulk delete exam calendars",
    description="Soft-delete multiple exam calendars and return a detailed summary.",
)
async def bulk_delete_exam_calendars(
    payload: dict,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "delete":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    ids = payload.get("ids", [])
    result = await service.bulk_delete(ids, deleted_by=payload.get("deletedBy") or payload.get("deleted_by"))
    return APIResponse(data=result, message="Bulk delete completed")


@router.post(
    "/bulk-status",
    response_model=APIResponse[dict],
    summary="Bulk status update",
    description="Update the status of many exam calendars at once.",
)
async def bulk_status_update_exam_calendars(
    payload: dict,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "edit":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    result = await service.bulk_status_update(
        payload.get("ids", []),
        payload.get("status", "Upcoming"),
        updated_by=payload.get("updatedBy") or payload.get("updated_by"),
    )
    return APIResponse(data=result, message="Bulk status update completed")


@router.get(
    "/audit",
    response_model=APIResponse[dict],
    summary="Exam calendar audit history",
    description="Retrieve a lightweight audit summary for the module.",
)
async def exam_calendar_audit(service: ExamCalendarService = Depends(get_exam_calendar_service)):
    history = await service.get_audit_history()
    return APIResponse(data={"items": history, "total": len(history)}, message="Audit history retrieved")


@router.get(
    "/stats",
    response_model=APIResponse[dict],
    summary="Exam calendar dashboard statistics",
    description="Expose production dashboard statistics for the exam calendar module.",
)
async def exam_calendar_stats(service: ExamCalendarService = Depends(get_exam_calendar_service)):
    return APIResponse(data=await service.get_stats(), message="Statistics retrieved")


@router.get(
    "/export",
    summary="Export exam calendar reports",
    description="Generate CSV/Excel/PDF-style reports for the current filter set.",
)
async def export_exam_calendars(
    format: Optional[str] = Query(default="csv"),
    academic_session: Optional[str] = Query(default=None),
    exam_type: Optional[str] = Query(default=None),
    exam_category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    created_by: Optional[str] = Query(default=None),
    updated_by: Optional[str] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "export":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    filters = {
        "academic_session": academic_session,
        "exam_type": exam_type,
        "exam_category": exam_category,
        "status": status,
        "created_by": created_by,
        "updated_by": updated_by,
        "start_date": start_date.isoformat() if start_date else None,
        "end_date": end_date.isoformat() if end_date else None,
    }
    content = await service.export_report(format_name=format or "csv", filters=filters)
    if format and format.lower() == "csv":
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=exam-calendar.csv"})
    return Response(content=content, media_type="application/octet-stream", headers={"Content-Disposition": "attachment; filename=exam-calendar.txt"})


@router.get(
    "/{entity_id}",
    response_model=APIResponse[ExamCalendarDetail],
    summary="Get exam calendar",
    description="Retrieve a single exam calendar by ID.",
)
async def get_exam_calendar(entity_id: int, service: ExamCalendarService = Depends(get_exam_calendar_service)):
    item = await service.get_exam_calendar(entity_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam calendar not found")
    return APIResponse(data=ExamCalendarDetail.model_validate(item))


@router.put(
    "/{entity_id}",
    response_model=APIResponse[ExamCalendarDetail],
    summary="Replace exam calendar",
    description="Replace an exam calendar entry by ID.",
)
async def replace_exam_calendar(
    entity_id: int,
    payload: ExamCalendarUpdate,
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    try:
        item = await service.update_exam_calendar(entity_id, payload)
    except ExamCalendarServiceError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam calendar not found")
    return APIResponse(data=ExamCalendarDetail.model_validate(item), message="Exam calendar updated")


@router.patch(
    "/{entity_id}",
    response_model=APIResponse[ExamCalendarDetail],
    summary="Update exam calendar",
    description="Update one or more exam calendar fields.",
)
async def patch_exam_calendar(
    entity_id: int,
    payload: ExamCalendarUpdate,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "edit":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    try:
        item = await service.update_exam_calendar(entity_id, payload)
    except ExamCalendarServiceError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam calendar not found")
    return APIResponse(data=ExamCalendarDetail.model_validate(item), message="Exam calendar updated")


@router.delete(
    "/{entity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete exam calendar",
    description="Soft-delete an exam calendar by ID.",
)
async def delete_exam_calendar(
    entity_id: int,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "delete":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    deleted = await service.delete_exam_calendar(entity_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exam calendar not found")
    return None


@router.post(
    "/search",
    response_model=APIResponse[SearchResponse[ExamCalendarListItem]],
    summary="Search exam calendars",
    description="Search exam calendars by the provided payload.",
)
async def search_exam_calendars_post(
    payload: SearchRequest,
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    items = await service.search_exam_calendars(query=payload.query)
    response = SearchResponse[ExamCalendarListItem](
        items=[ExamCalendarListItem.model_validate(item) for item in items],
        total=len(items),
    )
    return APIResponse(data=response)


@router.post(
    "/bulk-delete",
    response_model=APIResponse[dict],
    summary="Bulk delete exam calendars",
    description="Soft-delete multiple exam calendars and return a detailed summary.",
)
async def bulk_delete_exam_calendars(
    payload: dict,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "delete":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    ids = payload.get("ids", [])
    result = await service.bulk_delete(ids, deleted_by=payload.get("deletedBy") or payload.get("deleted_by"))
    return APIResponse(data=result, message="Bulk delete completed")


@router.post(
    "/bulk-status",
    response_model=APIResponse[dict],
    summary="Bulk status update",
    description="Update the status of many exam calendars at once.",
)
async def bulk_status_update_exam_calendars(
    payload: dict,
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "edit":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    result = await service.bulk_status_update(
        payload.get("ids", []),
        payload.get("status", "Upcoming"),
        updated_by=payload.get("updatedBy") or payload.get("updated_by"),
    )
    return APIResponse(data=result, message="Bulk status update completed")


@router.get(
    "/audit",
    response_model=APIResponse[dict],
    summary="Exam calendar audit history",
    description="Retrieve a lightweight audit summary for the module.",
)
async def exam_calendar_audit(service: ExamCalendarService = Depends(get_exam_calendar_service)):
    history = await service.get_audit_history()
    return APIResponse(data={"items": history, "total": len(history)}, message="Audit history retrieved")


@router.get(
    "/stats",
    response_model=APIResponse[dict],
    summary="Exam calendar dashboard statistics",
    description="Expose production dashboard statistics for the exam calendar module.",
)
async def exam_calendar_stats(service: ExamCalendarService = Depends(get_exam_calendar_service)):
    return APIResponse(data=await service.get_stats(), message="Statistics retrieved")


@router.get(
    "/export",
    summary="Export exam calendar reports",
    description="Generate CSV/Excel/PDF-style reports for the current filter set.",
)
async def export_exam_calendars(
    format: Optional[str] = Query(default="csv"),
    academic_session: Optional[str] = Query(default=None),
    exam_type: Optional[str] = Query(default=None),
    exam_category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    created_by: Optional[str] = Query(default=None),
    updated_by: Optional[str] = Query(default=None),
    start_date: Optional[date] = Query(default=None),
    end_date: Optional[date] = Query(default=None),
    x_user_role: Optional[str] = Header(default=None, alias="X-User-Role"),
    x_permission: Optional[str] = Header(default=None, alias="X-Permission"),
    service: ExamCalendarService = Depends(get_exam_calendar_service),
):
    if x_user_role == "Student" and x_permission == "export":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied")
    filters = {
        "academic_session": academic_session,
        "exam_type": exam_type,
        "exam_category": exam_category,
        "status": status,
        "created_by": created_by,
        "updated_by": updated_by,
        "start_date": start_date.isoformat() if start_date else None,
        "end_date": end_date.isoformat() if end_date else None,
    }
    content = await service.export_report(format_name=format or "csv", filters=filters)
    if format and format.lower() == "csv":
        return Response(content=content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=exam-calendar.csv"})
    return Response(content=content, media_type="application/octet-stream", headers={"Content-Disposition": "attachment; filename=exam-calendar.txt"})
