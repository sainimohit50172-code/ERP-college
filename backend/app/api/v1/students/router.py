from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.v1.shared.dependencies import get_student_repository, get_student_service
from app.models.students import Student
from app.schemas.shared.base import APIResponse, PaginationRequest, PaginationResponse
from app.schemas.students.schemas import StudentCreate, StudentDetail, StudentListItem, StudentUpdate
from app.services.students.service import StudentService, StudentServiceError

router = APIRouter(prefix="/students", tags=["students"])


def _student_to_detail(student: Student) -> StudentDetail:
    contact = student.contact or {}
    return StudentDetail(
        id=student.id,
        admission_number=student.admission_no,
        first_name=student.first_name,
        last_name=student.last_name,
        email=contact.get("email"),
        phone=contact.get("phone"),
        date_of_birth=student.dob,
        gender=student.gender,
        status=student.status,
        created_at=student.created_at,
    )


def _student_to_list_item(student: Student) -> StudentListItem:
    contact = student.contact or {}
    return StudentListItem(
        id=student.id,
        admission_number=student.admission_no,
        first_name=student.first_name,
        last_name=student.last_name,
        email=contact.get("email"),
        phone=contact.get("phone"),
        date_of_birth=student.dob,
        gender=student.gender,
        status=student.status,
    )


def _build_student_from_payload(payload: StudentCreate | StudentUpdate, existing: Student | None = None) -> Student:
    student = existing or Student()
    provided = None
    if isinstance(payload, StudentUpdate):
        provided = payload.model_dump(exclude_unset=True)
    if isinstance(payload, StudentCreate):
        student.admission_no = payload.admission_number
        student.first_name = payload.first_name
        student.last_name = payload.last_name
        student.dob = payload.date_of_birth
        student.gender = payload.gender
        student.status = payload.status or "Active"
    else:
        if payload.admission_number is not None:
            student.admission_no = payload.admission_number
        if payload.first_name is not None:
            student.first_name = payload.first_name
        if payload.last_name is not None:
            student.last_name = payload.last_name
        if payload.date_of_birth is not None:
            student.dob = payload.date_of_birth
        if payload.gender is not None:
            student.gender = payload.gender
        if payload.status is not None:
            student.status = payload.status

    if existing is None and isinstance(payload, StudentCreate):
        contact: dict[str, Any] = {}
        if payload.email is not None:
            contact["email"] = str(payload.email)
        if payload.phone is not None:
            contact["phone"] = payload.phone
        student.contact = contact or None
    elif isinstance(payload, StudentUpdate):
        contact = dict(existing.contact or {}) if existing is not None else {}
        provided = provided or {}
        # Only modify contact fields if they were provided in the payload
        if "email" in provided:
            if payload.email is None:
                contact.pop("email", None)
            else:
                contact["email"] = str(payload.email)
        if "phone" in provided:
            if payload.phone is None:
                contact.pop("phone", None)
            else:
                contact["phone"] = payload.phone
        student.contact = contact or None

    return student


def _get_searchable_value(student: Student, field: str) -> Any:
    if field == "admission_number":
        return student.admission_no
    if field == "date_of_birth":
        return student.dob
    if field == "email":
        return (student.contact or {}).get("email")
    if field == "phone":
        return (student.contact or {}).get("phone")
    return getattr(student, field, None)


async def _apply_search(items: list[Student], search: str | None) -> list[Student]:
    if not search:
        return items
    lowered = search.lower()
    return [
        student
        for student in items
        if lowered in (student.admission_no or "").lower()
        or lowered in (student.first_name or "").lower()
        or lowered in (student.last_name or "").lower()
        or lowered in str((student.contact or {}).get("email", "")).lower()
        or lowered in str((student.contact or {}).get("phone", "")).lower()
    ]


async def _apply_filter(items: list[Student], filter_field: str | None, filter_value: str | None, filter_operator: str) -> list[Student]:
    if not filter_field or filter_value is None:
        return items
    filtered: list[Student] = []
    for student in items:
        actual_value = _get_searchable_value(student, filter_field)
        if filter_operator == "eq" and actual_value == filter_value:
            filtered.append(student)
        elif filter_operator == "ne" and actual_value != filter_value:
            filtered.append(student)
        elif filter_operator == "contains" and isinstance(actual_value, str) and filter_value.lower() in actual_value.lower():
            filtered.append(student)
        elif filter_operator == "gt" and actual_value is not None and str(actual_value) > filter_value:
            filtered.append(student)
        elif filter_operator == "gte" and actual_value is not None and str(actual_value) >= filter_value:
            filtered.append(student)
        elif filter_operator == "lt" and actual_value is not None and str(actual_value) < filter_value:
            filtered.append(student)
        elif filter_operator == "lte" and actual_value is not None and str(actual_value) <= filter_value:
            filtered.append(student)
    return filtered


@router.get(
    "/",
    response_model=APIResponse[PaginationResponse[StudentListItem]],
    summary="List students",
    description="Retrieve a paginated list of students with optional search, filtering, and sorting.",
)
async def list_students(
    pagination: PaginationRequest = Depends(),
    search: str | None = Query(default=None, min_length=1),
    filter_field: str | None = Query(default=None, min_length=1),
    filter_value: str | None = Query(default=None),
    filter_operator: str = Query(default="eq", pattern="^(eq|ne|gt|gte|lt|lte|contains)$"),
    repository=Depends(get_student_repository),
):
    items = await repository.get_all()
    items = await _apply_search(items, search)
    items = await _apply_filter(items, filter_field, filter_value, filter_operator)

    if pagination.sort_by:
        sort_field = pagination.sort_by
        sort_key = {
            "admission_number": "admission_no",
            "date_of_birth": "dob",
            "first_name": "first_name",
            "last_name": "last_name",
            "status": "status",
            "email": "contact",
            "phone": "contact",
        }.get(sort_field, sort_field)

        def sort_item(student: Student) -> Any:
            if sort_key == "contact":
                return (student.contact or {}).get("email", "")
            return getattr(student, sort_key, None)

        items = sorted(items, key=sort_item, reverse=(pagination.sort_order == "desc"))

    total = len(items)
    start = (pagination.page - 1) * pagination.page_size
    end = start + pagination.page_size
    response = PaginationResponse[StudentListItem](
        items=[_student_to_list_item(item) for item in items[start:end]],
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=(total + pagination.page_size - 1) // pagination.page_size,
    )
    return APIResponse(data=response)


@router.post(
    "/",
    response_model=APIResponse[StudentDetail],
    status_code=status.HTTP_201_CREATED,
    summary="Create student",
    description="Create a new student account with validation and standardized response formatting.",
)
async def create_student(
    payload: StudentCreate,
    repository=Depends(get_student_repository),
    service: StudentService = Depends(get_student_service),
):
    try:
        await service.enroll_student(
            admission_number=payload.admission_number,
            first_name=payload.first_name,
            last_name=payload.last_name,
            status=payload.status,
        )
    except StudentServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    student = _build_student_from_payload(payload)
    created = await repository.create(student)
    return APIResponse(data=_student_to_detail(created), message="Student created")


@router.get(
    "/{student_id}",
    response_model=APIResponse[StudentDetail],
    summary="Get student",
    description="Retrieve a single student by ID.",
)
async def get_student(student_id: int, repository=Depends(get_student_repository)):
    student = await repository.get_by_id(student_id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return APIResponse(data=_student_to_detail(student))


@router.put(
    "/{student_id}",
    response_model=APIResponse[StudentDetail],
    summary="Update student",
    description="Replace a student record with the provided payload.",
)
async def update_student(
    student_id: int,
    payload: StudentUpdate,
    repository=Depends(get_student_repository),
):
    existing = await repository.get_by_id(student_id)
    if existing is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    if payload.admission_number is not None and payload.admission_number != existing.admission_no:
        duplicate = await repository.find_by_admission_no(payload.admission_number)
        if duplicate is not None and duplicate.id != student_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student admission number already exists")

    updated_student = _build_student_from_payload(payload, existing=existing)
    updated = await repository.update(student_id, updated_student)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return APIResponse(data=_student_to_detail(updated), message="Student updated")


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete student",
    description="Delete a student record by ID.",
)
async def delete_student(student_id: int, repository=Depends(get_student_repository)):
    deleted = await repository.delete(student_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return None


# expose dependency functions for tests and external overrides
router.get_student_repository = get_student_repository
router.get_student_service = get_student_service
