from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class DepartmentListItem(BaseModel):
    id: int
    name: str
    code: Optional[str] = None


class DepartmentDetail(DepartmentListItem):
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class DesignationCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DesignationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class DesignationListItem(BaseModel):
    id: int
    name: str


class DesignationDetail(DesignationListItem):
    description: Optional[str] = None
    created_at: Optional[datetime] = None


class AcademicYearCreate(BaseModel):
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class AcademicYearUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class AcademicYearListItem(BaseModel):
    id: int
    name: str


class AcademicYearDetail(AcademicYearListItem):
    start_date: Optional[date] = None
    end_date: Optional[date] = None


class SemesterCreate(BaseModel):
    name: str
    academic_year_id: Optional[int] = None


class SemesterUpdate(BaseModel):
    name: Optional[str] = None
    academic_year_id: Optional[int] = None


class SemesterListItem(BaseModel):
    id: int
    name: str


class SemesterDetail(SemesterListItem):
    academic_year_id: Optional[int] = None


class CourseCreate(BaseModel):
    name: str
    code: Optional[str] = None
    department_id: Optional[int] = None


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    department_id: Optional[int] = None


class CourseListItem(BaseModel):
    id: int
    name: str
    code: Optional[str] = None


class CourseDetail(CourseListItem):
    department_id: Optional[int] = None


class SubjectCreate(BaseModel):
    name: str
    code: Optional[str] = None
    course_id: Optional[int] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    course_id: Optional[int] = None


class SubjectListItem(BaseModel):
    id: int
    name: str
    course_id: Optional[int] = None


class SubjectDetail(SubjectListItem):
    code: Optional[str] = None


class AcademicClassCreate(BaseModel):
    name: str
    course_id: Optional[int] = None
    year_id: Optional[int] = None


class AcademicClassUpdate(BaseModel):
    name: Optional[str] = None
    course_id: Optional[int] = None
    year_id: Optional[int] = None


class AcademicClassListItem(BaseModel):
    id: int
    name: str
    course_id: Optional[int] = None


class AcademicClassDetail(AcademicClassListItem):
    year_id: Optional[int] = None


class SectionCreate(BaseModel):
    name: str
    academic_class_id: Optional[int] = None


class SectionUpdate(BaseModel):
    name: Optional[str] = None
    academic_class_id: Optional[int] = None


class SectionListItem(BaseModel):
    id: int
    name: str


class SectionDetail(SectionListItem):
    academic_class_id: Optional[int] = None


class AssessmentGradeSetupCreate(BaseModel):
    name: str
    code: Optional[str] = None
    grade_band: Optional[str] = None
    min_score: Optional[int] = None
    max_score: Optional[int] = None
    grade_point: Optional[float] = None
    status: Optional[str] = "Active"
    description: Optional[str] = None


class AssessmentGradeSetupUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    grade_band: Optional[str] = None
    min_score: Optional[int] = None
    max_score: Optional[int] = None
    grade_point: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None


class AssessmentGradeSetupListItem(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    grade_band: Optional[str] = None
    min_score: Optional[int] = None
    max_score: Optional[int] = None
    grade_point: Optional[float] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class AssessmentGradeSetupDetail(AssessmentGradeSetupListItem):
    description: Optional[str] = None


# Attendance Marks Setup
class AttendanceMarksConfigCreate(BaseModel):
    marks: int
    min_attendance_percentage: int = 0
    max_attendance_percentage: int = 100


class AttendanceMarksConfigUpdate(BaseModel):
    marks: Optional[int] = None
    min_attendance_percentage: Optional[int] = None
    max_attendance_percentage: Optional[int] = None


class AttendanceMarksConfigListItem(BaseModel):
    id: int
    marks: int
    min_attendance_percentage: int
    max_attendance_percentage: int


class AttendanceMarksConfigDetail(AttendanceMarksConfigListItem):
    created_at: Optional[datetime] = None


class AttendanceMarksSetupCreate(BaseModel):
    name: str
    configs: Optional[list[AttendanceMarksConfigCreate]] = []


class AttendanceMarksSetupUpdate(BaseModel):
    name: Optional[str] = None
    configs: Optional[list[AttendanceMarksConfigUpdate]] = None


class AttendanceMarksSetupListItem(BaseModel):
    id: int
    name: str
    configs_count: Optional[int] = 0


class AttendanceMarksSetupDetail(AttendanceMarksSetupListItem):
    configs: Optional[list[AttendanceMarksConfigListItem]] = []


class AssessmentConfigCreate(BaseModel):
    name: str
    code: Optional[str] = None
    assessment_type: Optional[str] = None
    key: Optional[str] = None
    value: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None


class AssessmentConfigUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    assessment_type: Optional[str] = None
    key: Optional[str] = None
    value: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None


class AssessmentConfigListItem(BaseModel):
    id: int
    name: str
    code: Optional[str] = None
    assessment_type: Optional[str] = None
    key: Optional[str] = None
    value: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None


class AssessmentConfigDetail(AssessmentConfigListItem):
    description: Optional[str] = None


# Assessment Group schemas
class AssessmentGroupItemCreate(BaseModel):
    assessment_name: str
    assessment_model: Optional[str] = None
    display_name: Optional[str] = None
    sequence_no: Optional[int] = None
    result_declared: Optional[bool] = False
    include_in_total: Optional[bool] = False
    display_value: Optional[bool] = False
    show_graph: Optional[bool] = False
    passing_required: Optional[bool] = False


class AssessmentGroupItemListItem(AssessmentGroupItemCreate):
    id: int


class AssessmentGroupItemDetail(AssessmentGroupItemListItem):
    pass


class AssessmentGroupCreate(BaseModel):
    name: str
    college_id: Optional[int] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    grade_setup_id: Optional[int] = None
    weightage: Optional[float] = None
    edit_result: Optional[bool] = False
    items: Optional[list[AssessmentGroupItemCreate]] = []


class AssessmentGroupUpdate(BaseModel):
    name: Optional[str] = None
    college_id: Optional[int] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    grade_setup_id: Optional[int] = None
    weightage: Optional[float] = None
    edit_result: Optional[bool] = None
    items: Optional[list[AssessmentGroupItemCreate]] = None


class AssessmentGroupListItem(BaseModel):
    id: int
    name: str
    college_id: Optional[int] = None
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    grade_setup_id: Optional[int] = None
    weightage: Optional[float] = None
    edit_result: Optional[bool] = None
    created_at: Optional[datetime] = None


class AssessmentGroupDetail(AssessmentGroupListItem):
    items: Optional[list[AssessmentGroupItemListItem]] = []
