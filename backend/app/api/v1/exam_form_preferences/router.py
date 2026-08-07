from __future__ import annotations

from datetime import datetime
from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select

from app.db.database import get_db
from app.models.exam_form_preferences import CoeExamFormHeaderFooter, CoeExamFormPreference, CoeExamFormPreferenceSetting, ExamFormHeaderFooter, ExamFormPreference
from app.repositories.mysql.exam_form_preferences import (
    MySQLCoeExamFormPreferenceRepository,
    MySQLExamFormHeaderFooterRepository,
    MySQLExamFormPreferenceRepository,
)
from app.schemas.exam_form_preferences import (
    ExamFormHeaderFooterCreate,
    ExamFormHeaderFooterDetail,
    ExamFormHeaderFooterUpdate,
    ExamFormPreferenceCreate,
    ExamFormPreferenceDetail,
    ExamFormPreferenceUpdate,
    CoeExamFormPreferenceCreate,
    CoeExamFormPreferenceDetail,
    CoeExamFormPreferenceSettingsDetail,
    CoeExamFormPreferenceSettingsUpdate,
    CoeExamFormPreferenceUpdate,
    CoeExamFormHeaderFooterCreate,
    CoeExamFormHeaderFooterDetail,
    CoeExamFormHeaderFooterUpdate,
)
from app.schemas.shared.base import APIResponse, PaginationResponse
from app.services.exam_form_preferences import ExamFormService, ExamFormServiceError

router = APIRouter(tags=["exam-form-preferences"])


def preference_service(db=Depends(get_db)):
    return ExamFormService(MySQLExamFormPreferenceRepository(db), ExamFormPreference, ExamFormPreferenceCreate)


def header_footer_service(db=Depends(get_db)):
    return ExamFormService(MySQLExamFormHeaderFooterRepository(db), ExamFormHeaderFooter, ExamFormHeaderFooterCreate)


def coe_preference_service(db=Depends(get_db)):
    return ExamFormService(MySQLCoeExamFormPreferenceRepository(db), CoeExamFormPreference, CoeExamFormPreferenceCreate, default_actor=None)


def pagination(items, total, page, page_size, schema):
    return PaginationResponse(
        items=[schema.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        pages=ceil(total / page_size) if total else 0,
    )


async def list_records(service, page, page_size, query, status_filter, exam_type, institute, sort_by, sort_order, schema):
    try:
        items, total = await service.list(page, page_size, query, status_filter, exam_type, institute, sort_by, sort_order)
        return APIResponse(data=pagination(items, total, page, page_size, schema))
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/exam-form-preferences/", response_model=APIResponse[PaginationResponse[ExamFormPreferenceDetail]])
async def list_exam_form_preferences(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search: Optional[str] = None, status_filter: Optional[str] = Query(None, alias="status"), exam_type: Optional[str] = Query(None, alias="examType"), institute: Optional[str] = None, sort_by: str = "created_at", sort_order: str = Query("desc", pattern="^(asc|desc)$"), service: ExamFormService = Depends(preference_service)):
    return await list_records(service, page, page_size, search, status_filter, exam_type, institute, sort_by, sort_order, ExamFormPreferenceDetail)


@router.post("/exam-form-preferences/", response_model=APIResponse[ExamFormPreferenceDetail], status_code=status.HTTP_201_CREATED)
async def create_exam_form_preference(payload: ExamFormPreferenceCreate, service: ExamFormService = Depends(preference_service)):
    try:
        item = await service.create(payload)
        return APIResponse(data=ExamFormPreferenceDetail.model_validate(item), message="Exam form preference created")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/exam-form-preferences/search", response_model=APIResponse[PaginationResponse[ExamFormPreferenceDetail]])
async def search_exam_form_preferences(query: Optional[str] = Query(None, min_length=1), page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), service: ExamFormService = Depends(preference_service)):
    search_query = query or ""
    return await list_records(service, page, page_size, search_query, None, None, None, "created_at", "desc", ExamFormPreferenceDetail)


@router.get("/exam-form-preferences/{entity_id}", response_model=APIResponse[ExamFormPreferenceDetail])
async def get_exam_form_preference(entity_id: int, service: ExamFormService = Depends(preference_service)):
    try:
        return APIResponse(data=ExamFormPreferenceDetail.model_validate(await service.get(entity_id)))
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/exam-form-preferences/{entity_id}", response_model=APIResponse[ExamFormPreferenceDetail])
@router.patch("/exam-form-preferences/{entity_id}", response_model=APIResponse[ExamFormPreferenceDetail])
async def update_exam_form_preference(entity_id: int, payload: ExamFormPreferenceUpdate, service: ExamFormService = Depends(preference_service)):
    try:
        return APIResponse(data=ExamFormPreferenceDetail.model_validate(await service.update(entity_id, payload)), message="Exam form preference updated")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/exam-form-preferences/{entity_id}", response_model=APIResponse[dict[str, bool]])
async def delete_exam_form_preference(entity_id: int, service: ExamFormService = Depends(preference_service)):
    try:
        await service.delete(entity_id)
        return APIResponse(data={"success": True}, message="Exam form preference deleted")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/exam-form-headers-footers/", response_model=APIResponse[PaginationResponse[ExamFormHeaderFooterDetail]])
async def list_exam_form_headers_footers(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search: Optional[str] = None, status_filter: Optional[str] = Query(None, alias="status"), exam_type: Optional[str] = Query(None, alias="examType"), institute: Optional[str] = None, sort_by: str = "created_at", sort_order: str = Query("desc", pattern="^(asc|desc)$"), service: ExamFormService = Depends(header_footer_service)):
    return await list_records(service, page, page_size, search, status_filter, exam_type, institute, sort_by, sort_order, ExamFormHeaderFooterDetail)


@router.post("/exam-form-headers-footers/", response_model=APIResponse[ExamFormHeaderFooterDetail], status_code=status.HTTP_201_CREATED)
async def create_exam_form_header_footer(payload: ExamFormHeaderFooterCreate, service: ExamFormService = Depends(header_footer_service)):
    try:
        item = await service.create(payload)
        return APIResponse(data=ExamFormHeaderFooterDetail.model_validate(item), message="Exam form header/footer created")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/exam-form-headers-footers/search", response_model=APIResponse[PaginationResponse[ExamFormHeaderFooterDetail]])
async def search_exam_form_headers_footers(query: Optional[str] = Query(None, min_length=1), page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), service: ExamFormService = Depends(header_footer_service)):
    search_query = query or ""
    return await list_records(service, page, page_size, search_query, None, None, None, "created_at", "desc", ExamFormHeaderFooterDetail)


@router.get("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[ExamFormHeaderFooterDetail])
async def get_exam_form_header_footer(entity_id: int, service: ExamFormService = Depends(header_footer_service)):
    try:
        return APIResponse(data=ExamFormHeaderFooterDetail.model_validate(await service.get(entity_id)))
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.put("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[ExamFormHeaderFooterDetail])
@router.patch("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[ExamFormHeaderFooterDetail])
async def update_exam_form_header_footer(entity_id: int, payload: ExamFormHeaderFooterUpdate, service: ExamFormService = Depends(header_footer_service)):
    try:
        return APIResponse(data=ExamFormHeaderFooterDetail.model_validate(await service.update(entity_id, payload)), message="Exam form header/footer updated")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.delete("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[dict[str, bool]])
async def delete_exam_form_header_footer(entity_id: int, service: ExamFormService = Depends(header_footer_service)):
    try:
        await service.delete(entity_id)
        return APIResponse(data={"success": True}, message="Exam form header/footer deleted")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


coe_router = APIRouter(prefix="/coe", tags=["coe-exam-form-preferences"])


@coe_router.get("/exam-form-preferences/settings", response_model=APIResponse[CoeExamFormPreferenceSettingsDetail])
async def get_coe_exam_form_preference_settings(db=Depends(get_db)):
    result = db.execute(select(CoeExamFormPreferenceSetting).order_by(CoeExamFormPreferenceSetting.id.asc()).limit(1))
    setting = result.scalars().first()
    if setting is None:
        return APIResponse(data=CoeExamFormPreferenceSettingsDetail(id=0), message="Exam form preference settings loaded")
    return APIResponse(data=CoeExamFormPreferenceSettingsDetail.model_validate(setting), message="Exam form preference settings loaded")


@coe_router.put("/exam-form-preferences/settings", response_model=APIResponse[CoeExamFormPreferenceSettingsDetail])
async def update_coe_exam_form_preference_settings(payload: CoeExamFormPreferenceSettingsUpdate, db=Depends(get_db)):
    result = db.execute(select(CoeExamFormPreferenceSetting).order_by(CoeExamFormPreferenceSetting.id.asc()).limit(1))
    setting = result.scalars().first()
    values = payload.model_dump(by_alias=False, exclude_unset=True)
    if setting is None:
        setting = CoeExamFormPreferenceSetting(**values)
        db.add(setting)
    else:
        for key, value in values.items():
            setattr(setting, key, value)
        setting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(setting)
    return APIResponse(data=CoeExamFormPreferenceSettingsDetail.model_validate(setting), message="Exam form preference settings saved")


@coe_router.get("/exam-form-preferences", response_model=APIResponse[PaginationResponse[CoeExamFormPreferenceDetail]])
async def list_coe_exam_form_preferences(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), search: Optional[str] = None, status_filter: Optional[str] = Query(None, alias="status"), sort_by: str = "created_at", sort_order: str = Query("desc", pattern="^(asc|desc)$"), service: ExamFormService = Depends(coe_preference_service)):
    return await list_records(service, page, page_size, search, status_filter, None, None, sort_by, sort_order, CoeExamFormPreferenceDetail)


@coe_router.post("/exam-form-preferences", response_model=APIResponse[CoeExamFormPreferenceDetail], status_code=status.HTTP_201_CREATED)
async def create_coe_exam_form_preference(payload: CoeExamFormPreferenceCreate, service: ExamFormService = Depends(coe_preference_service)):
    try:
        keys = ("academic_session_id", "institute_id", "course_id", "program_id", "semester_id", "exam_type_id")
        if await service.repository.get_by_combination({key: getattr(payload, key) for key in keys}):
            raise HTTPException(status_code=409, detail="This academic session, institute, course, program, semester and exam type combination already exists.")
        item = await service.create(payload)
        return APIResponse(data=CoeExamFormPreferenceDetail.model_validate(item), message="Exam form preference created")
    except HTTPException:
        raise
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@coe_router.get("/exam-form-preferences/search", response_model=APIResponse[PaginationResponse[CoeExamFormPreferenceDetail]])
async def search_coe_exam_form_preferences(query: Optional[str] = Query(None, min_length=1), page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100), service: ExamFormService = Depends(coe_preference_service)):
    search_query = query or ""
    return await list_records(service, page, page_size, search_query, None, None, None, "created_at", "desc", CoeExamFormPreferenceDetail)


@coe_router.get("/exam-form-preferences/{entity_id}", response_model=APIResponse[CoeExamFormPreferenceDetail])
async def get_coe_exam_form_preference(entity_id: int, service: ExamFormService = Depends(coe_preference_service)):
    try:
        return APIResponse(data=CoeExamFormPreferenceDetail.model_validate(await service.get(entity_id)))
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@coe_router.put("/exam-form-preferences/{entity_id}", response_model=APIResponse[CoeExamFormPreferenceDetail])
async def update_coe_exam_form_preference(entity_id: int, payload: CoeExamFormPreferenceUpdate, service: ExamFormService = Depends(coe_preference_service)):
    try:
        current = await service.get(entity_id)
        keys = ("academic_session_id", "institute_id", "course_id", "program_id", "semester_id", "exam_type_id")
        merged = {key: getattr(current, key) for key in keys}
        merged.update(payload.model_dump(by_alias=False, exclude_unset=True))
        if await service.repository.get_by_combination(merged, exclude_id=entity_id):
            raise HTTPException(status_code=409, detail="This academic session, institute, course, program, semester and exam type combination already exists.")
        item = await service.update(entity_id, payload)
        return APIResponse(data=CoeExamFormPreferenceDetail.model_validate(item), message="Exam form preference updated")
    except HTTPException:
        raise
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@coe_router.delete("/exam-form-preferences/{entity_id}", response_model=APIResponse[dict[str, bool]])
async def delete_coe_exam_form_preference(entity_id: int, service: ExamFormService = Depends(coe_preference_service)):
    try:
        await service.delete(entity_id)
        return APIResponse(data={"success": True}, message="Exam form preference deleted")
    except ExamFormServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@coe_router.get("/exam-form-headers-footers", response_model=APIResponse[list[CoeExamFormHeaderFooterDetail]])
def list_coe_exam_form_headers_footers(db=Depends(get_db)):
    result = db.execute(select(CoeExamFormHeaderFooter).order_by(CoeExamFormHeaderFooter.section_type, CoeExamFormHeaderFooter.template_type))
    return APIResponse(data=[CoeExamFormHeaderFooterDetail.model_validate(item) for item in result.scalars().all()])


@coe_router.post("/exam-form-headers-footers", response_model=APIResponse[CoeExamFormHeaderFooterDetail], status_code=status.HTTP_201_CREATED)
def create_coe_exam_form_header_footer(payload: CoeExamFormHeaderFooterCreate, db=Depends(get_db)):
    duplicate = db.execute(select(CoeExamFormHeaderFooter).where(
        CoeExamFormHeaderFooter.institute_id == payload.institute_id,
        CoeExamFormHeaderFooter.exam_type_id == payload.exam_type_id,
        CoeExamFormHeaderFooter.section_type == payload.section_type,
        CoeExamFormHeaderFooter.template_type == payload.template_type,
    )).scalars().first()
    if duplicate:
        raise HTTPException(status_code=409, detail="This header/footer slot already exists.")
    item = CoeExamFormHeaderFooter(**payload.model_dump(by_alias=False))
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeExamFormHeaderFooterDetail.model_validate(item), message="Header/footer saved")


@coe_router.get("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[CoeExamFormHeaderFooterDetail])
def get_coe_exam_form_header_footer(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeExamFormHeaderFooter, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Header/footer not found")
    return APIResponse(data=CoeExamFormHeaderFooterDetail.model_validate(item))


@coe_router.put("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[CoeExamFormHeaderFooterDetail])
def update_coe_exam_form_header_footer(entity_id: int, payload: CoeExamFormHeaderFooterUpdate, db=Depends(get_db)):
    item = db.get(CoeExamFormHeaderFooter, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Header/footer not found")
    for key, value in payload.model_dump(by_alias=False, exclude_unset=True).items():
        setattr(item, key, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return APIResponse(data=CoeExamFormHeaderFooterDetail.model_validate(item), message="Header/footer updated")


@coe_router.delete("/exam-form-headers-footers/{entity_id}", response_model=APIResponse[dict[str, bool]])
def delete_coe_exam_form_header_footer(entity_id: int, db=Depends(get_db)):
    item = db.get(CoeExamFormHeaderFooter, entity_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Header/footer not found")
    db.delete(item)
    db.commit()
    return APIResponse(data={"success": True}, message="Header/footer deleted")


router.include_router(coe_router)
