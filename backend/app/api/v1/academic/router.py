from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import (
    get_department_repository,
    get_designation_repository,
    get_academic_year_repository,
    get_semester_repository,
    get_course_repository,
    get_subject_repository,
    get_academic_class_repository,
    get_section_repository,
    get_assessment_grade_setup_repository,
    get_attendance_marks_setup_repository,
    get_academic_service,
)
from app.models.academic import (
    Department,
    Designation,
    AcademicYear,
    Semester,
    Course,
    Subject,
    AcademicClass,
    Section,
    AssessmentGradeSetup,
    AssessmentConfig,
    AssessmentGroup,
    AttendanceMarksSetup,
)
from app.schemas.academic.schemas import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentDetail,
    DepartmentListItem,
    DesignationCreate,
    DesignationUpdate,
    DesignationDetail,
    DesignationListItem,
    AcademicYearCreate,
    AcademicYearUpdate,
    AcademicYearDetail,
    AcademicYearListItem,
    SemesterCreate,
    SemesterUpdate,
    SemesterDetail,
    SemesterListItem,
    CourseCreate,
    CourseUpdate,
    CourseDetail,
    CourseListItem,
    SubjectCreate,
    SubjectUpdate,
    SubjectDetail,
    SubjectListItem,
    AcademicClassCreate,
    AcademicClassUpdate,
    AcademicClassDetail,
    AcademicClassListItem,
    SectionCreate,
    SectionUpdate,
    SectionDetail,
    SectionListItem,
    AssessmentConfigCreate,
    AssessmentConfigUpdate,
    AssessmentConfigDetail,
    AssessmentConfigListItem,
    AssessmentGradeSetupCreate,
    AssessmentGradeSetupUpdate,
    AssessmentGradeSetupDetail,
    AssessmentGradeSetupListItem,
    AttendanceMarksSetupCreate,
    AttendanceMarksSetupUpdate,
    AttendanceMarksSetupDetail,
    AttendanceMarksSetupListItem,
)
from app.schemas.shared.base import APIResponse, PaginationRequest, PaginationResponse
from pydantic import BaseModel
from fastapi import APIRouter, Depends



# Build routers for each academic entity using the generic CRUD builder.
dept_router = build_crud_router(
    prefix="/departments",
    tags=["departments"],
    repository_dependency=get_department_repository,
    service_dependency=get_academic_service,
    model_class=Department,
    create_schema=DepartmentCreate,
    update_schema=DepartmentUpdate,
    detail_schema=DepartmentDetail,
    list_schema=DepartmentListItem,
    bulk_update_schema=DepartmentUpdate,
)

designation_router = build_crud_router(
    prefix="/designations",
    tags=["designations"],
    repository_dependency=get_designation_repository,
    service_dependency=get_academic_service,
    model_class=Designation,
    create_schema=DesignationCreate,
    update_schema=DesignationUpdate,
    detail_schema=DesignationDetail,
    list_schema=DesignationListItem,
    bulk_update_schema=DesignationUpdate,
)

year_router = build_crud_router(
    prefix="/academic-years",
    tags=["academic-years"],
    repository_dependency=get_academic_year_repository,
    service_dependency=get_academic_service,
    model_class=AcademicYear,
    create_schema=AcademicYearCreate,
    update_schema=AcademicYearUpdate,
    detail_schema=AcademicYearDetail,
    list_schema=AcademicYearListItem,
    bulk_update_schema=AcademicYearUpdate,
)

semester_router = build_crud_router(
    prefix="/semesters",
    tags=["semesters"],
    repository_dependency=get_semester_repository,
    service_dependency=get_academic_service,
    model_class=Semester,
    create_schema=SemesterCreate,
    update_schema=SemesterUpdate,
    detail_schema=SemesterDetail,
    list_schema=SemesterListItem,
    bulk_update_schema=SemesterUpdate,
)

course_router = build_crud_router(
    prefix="/courses",
    tags=["courses"],
    repository_dependency=get_course_repository,
    service_dependency=get_academic_service,
    model_class=Course,
    create_schema=CourseCreate,
    update_schema=CourseUpdate,
    detail_schema=CourseDetail,
    list_schema=CourseListItem,
    bulk_update_schema=CourseUpdate,
)

subject_router = build_crud_router(
    prefix="/subjects",
    tags=["subjects"],
    repository_dependency=get_subject_repository,
    service_dependency=get_academic_service,
    model_class=Subject,
    create_schema=SubjectCreate,
    update_schema=SubjectUpdate,
    detail_schema=SubjectDetail,
    list_schema=SubjectListItem,
    bulk_update_schema=SubjectUpdate,
)

class_router = build_crud_router(
    prefix="/classes",
    tags=["classes"],
    repository_dependency=get_academic_class_repository,
    service_dependency=get_academic_service,
    model_class=AcademicClass,
    create_schema=AcademicClassCreate,
    update_schema=AcademicClassUpdate,
    detail_schema=AcademicClassDetail,
    list_schema=AcademicClassListItem,
    bulk_update_schema=AcademicClassUpdate,
)

section_router = build_crud_router(
    prefix="/sections",
    tags=["sections"],
    repository_dependency=get_section_repository,
    service_dependency=get_academic_service,
    model_class=Section,
    create_schema=SectionCreate,
    update_schema=SectionUpdate,
    detail_schema=SectionDetail,
    list_schema=SectionListItem,
    bulk_update_schema=SectionUpdate,
)

assessment_grade_setup_router = build_crud_router(
    prefix="/assessment-grade-setups",
    tags=["assessment-grade-setups"],
    repository_dependency=get_assessment_grade_setup_repository,
    service_dependency=get_academic_service,
    model_class=AssessmentGradeSetup,
    create_schema=AssessmentGradeSetupCreate,
    update_schema=AssessmentGradeSetupUpdate,
    detail_schema=AssessmentGradeSetupDetail,
    list_schema=AssessmentGradeSetupListItem,
    bulk_update_schema=AssessmentGradeSetupUpdate,
)


assessment_config_router = build_crud_router(
    prefix="/assessment-configs",
    tags=["assessment-configs"],
    repository_dependency=get_assessment_config_repository,
    service_dependency=get_academic_service,
    model_class=AssessmentConfig,
    create_schema=AssessmentConfigCreate,
    update_schema=AssessmentConfigUpdate,
    detail_schema=AssessmentConfigDetail,
    list_schema=AssessmentConfigListItem,
    bulk_update_schema=AssessmentConfigUpdate,
)

assessment_group_router = build_crud_router(
    prefix="/assessment-group",
    tags=["assessment-group"],
    repository_dependency=get_assessment_group_repository,
    service_dependency=get_academic_service,
    model_class=None,  # model used by repository
    model_class=AssessmentGroup,
    create_schema=AssessmentGroupCreate,
    update_schema=AssessmentGroupUpdate,
    detail_schema=AssessmentGroupDetail,
    list_schema=AssessmentGroupListItem,
    bulk_update_schema=AssessmentGroupUpdate,
)


@router.post('/assessment-group/{id}/copy', response_model=APIResponse[AssessmentGroupDetail])
async def copy_assessment_group(id: int, repo=Depends(get_assessment_group_repository)):
    """Duplicate an existing assessment group including its items."""
    try:
        new_group = await repo.copy_group(id)
    except Exception as exc:
        return APIResponse(success=False, message=str(exc), data=None)

    return APIResponse(success=True, message='Copied', data=new_group)


attendance_marks_setup_router = build_crud_router(
    prefix="/attendance-marks-setup",
    tags=["attendance-marks-setup"],
    repository_dependency=get_attendance_marks_setup_repository,
    service_dependency=get_academic_service,
    model_class=AttendanceMarksSetup,
    create_schema=AttendanceMarksSetupCreate,
    update_schema=AttendanceMarksSetupUpdate,
    detail_schema=AttendanceMarksSetupDetail,
    list_schema=AttendanceMarksSetupListItem,
    bulk_update_schema=AttendanceMarksSetupUpdate,
)

from fastapi import APIRouter, Query
from app.schemas.shared.base import APIResponse, PaginationRequest, PaginationResponse

# Stub response schemas for unimplemented resources
class StubListItem(BaseModel):
    id: int = 1
    name: str = "Placeholder"

router = APIRouter()
for r in [
    dept_router,
    designation_router,
    year_router,
    semester_router,
    course_router,
    subject_router,
    class_router,
    section_router,
    assessment_grade_setup_router,
    assessment_config_router,
    assessment_group_router,
    attendance_marks_setup_router,
]:
    router.include_router(r)

# Stub endpoints for resources referenced by frontend but not yet fully implemented
@router.get("/subject-assignments", response_model=APIResponse[PaginationResponse[dict]])
async def list_subject_assignments(pagination: PaginationRequest = Depends()):
    """Stub endpoint for subject assignments - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/fee-payments", response_model=APIResponse[PaginationResponse[dict]])
async def list_fee_payments(pagination: PaginationRequest = Depends()):
    """Stub endpoint for fee payments - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/internal-marks", response_model=APIResponse[PaginationResponse[dict]])
async def list_internal_marks(pagination: PaginationRequest = Depends()):
    """Stub endpoint for internal marks - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/practical-marks", response_model=APIResponse[PaginationResponse[dict]])
async def list_practical_marks(pagination: PaginationRequest = Depends()):
    """Stub endpoint for practical marks - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/student-promotions", response_model=APIResponse[PaginationResponse[dict]])
async def list_student_promotions(pagination: PaginationRequest = Depends()):
    """Stub endpoint for student promotions - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/student-attendance", response_model=APIResponse[PaginationResponse[dict]])
async def list_student_attendance(pagination: PaginationRequest = Depends()):
    """Stub endpoint for student attendance - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )

@router.get("/results", response_model=APIResponse[PaginationResponse[dict]])
async def list_results(pagination: PaginationRequest = Depends()):
    """Stub endpoint for results - returns empty list"""
    return APIResponse(
        success=True,
        message="Success",
        data=PaginationResponse(items=[], total=0, page=pagination.page, page_size=pagination.page_size, pages=0)
    )
