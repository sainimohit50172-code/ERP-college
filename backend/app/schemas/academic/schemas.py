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


class SubjectDetail(SubjectListItem):
    code: Optional[str] = None
    course_id: Optional[int] = None


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


class AcademicClassDetail(AcademicClassListItem):
    course_id: Optional[int] = None
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
