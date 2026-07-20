from fastapi import APIRouter, Depends

from app.schemas.shared.base import APIResponse, PaginationRequest, PaginationResponse

router = APIRouter(prefix="", tags=["compat"])


def _build_response(page: int, page_size: int, items: list[dict] | None = None, total: int = 0):
    safe_items = items or []
    return APIResponse(
        data=PaginationResponse(
            items=safe_items,
            total=total,
            page=page,
            page_size=page_size,
            pages=(total + page_size - 1) // page_size if page_size else 0,
        )
    )


@router.get("/leads/", response_model=APIResponse[PaginationResponse[dict]], summary="List leads")
@router.get("/leads", response_model=APIResponse[PaginationResponse[dict]], include_in_schema=False)
async def list_leads(pagination: PaginationRequest = Depends()):
    return _build_response(pagination.page, pagination.page_size, total=0)


@router.get("/timetables/", response_model=APIResponse[PaginationResponse[dict]], summary="List timetables")
@router.get("/timetables", response_model=APIResponse[PaginationResponse[dict]], include_in_schema=False)
async def list_timetables(pagination: PaginationRequest = Depends()):
    return _build_response(pagination.page, pagination.page_size, total=0)


@router.get("/lecture-notes/", response_model=APIResponse[PaginationResponse[dict]], summary="List lecture notes")
@router.get("/lecture-notes", response_model=APIResponse[PaginationResponse[dict]], include_in_schema=False)
async def list_lecture_notes(pagination: PaginationRequest = Depends()):
    return _build_response(pagination.page, pagination.page_size, total=0)


@router.get("/syllabi/", response_model=APIResponse[PaginationResponse[dict]], summary="List syllabi")
@router.get("/syllabi", response_model=APIResponse[PaginationResponse[dict]], include_in_schema=False)
async def list_syllabi(pagination: PaginationRequest = Depends()):
    return _build_response(pagination.page, pagination.page_size, total=0)
