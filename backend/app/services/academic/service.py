from __future__ import annotations

from typing import Any, Optional

from app.repositories.interfaces.academic import (
    DepartmentRepository,
    DesignationRepository,
    AcademicYearRepository,
    SemesterRepository,
    CourseRepository,
    SubjectRepository,
    AcademicClassRepository,
    SectionRepository,
)


class AcademicServiceError(Exception):
    pass


class AcademicService:
    def __init__(
        self,
        department_repo: DepartmentRepository,
        designation_repo: DesignationRepository,
        year_repo: AcademicYearRepository,
        semester_repo: SemesterRepository,
        course_repo: CourseRepository,
        subject_repo: SubjectRepository,
        class_repo: AcademicClassRepository,
        section_repo: SectionRepository,
    ) -> None:
        self.departments = department_repo
        self.designations = designation_repo
        self.academic_years = year_repo
        self.semesters = semester_repo
        self.courses = course_repo
        self.subjects = subject_repo
        self.academic_classes = class_repo
        self.sections = section_repo
