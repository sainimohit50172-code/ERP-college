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
    AssessmentGradeSetupRepository,
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
        assessment_grade_setup_repo: AssessmentGradeSetupRepository,
        attendance_marks_setup_repo=None,
    ) -> None:
        self.departments = department_repo
        self.designations = designation_repo
        self.academic_years = year_repo
        self.semesters = semester_repo
        self.courses = course_repo
        self.subjects = subject_repo
        self.academic_classes = class_repo
        self.sections = section_repo
        self.assessment_grade_setups = assessment_grade_setup_repo
        self.attendance_marks_setups = attendance_marks_setup_repo

    # Attendance marks setup helpers
    async def create_attendance_marks_setup(self, name: str, configs: list[dict] | None = None):
        # Lazy import to avoid circulars
        from app.models.academic import AttendanceMarksSetup, AttendanceMarksConfig

        if self.attendance_marks_setups is None:
            raise AcademicServiceError("AttendanceMarksSetup repository not configured")
        entity = AttendanceMarksSetup(name=name)
        for cfg in configs or []:
            entity.configs.append(AttendanceMarksConfig(
                marks=cfg.get('marks'),
                min_attendance_percentage=cfg.get('min_attendance_percentage', 0),
                max_attendance_percentage=cfg.get('max_attendance_percentage', 100),
            ))
        return await self.attendance_marks_setups.create_with_configs(entity)

    async def update_attendance_marks_setup(self, entity_id: int, name: str | None = None, configs: list[dict] | None = None):
        from app.models.academic import AttendanceMarksSetup, AttendanceMarksConfig

        if self.attendance_marks_setups is None:
            raise AcademicServiceError("AttendanceMarksSetup repository not configured")
        entity = AttendanceMarksSetup(name=name if name is not None else "")
        entity.configs = []
        for cfg in configs or []:
            entity.configs.append(AttendanceMarksConfig(
                marks=cfg.get('marks'),
                min_attendance_percentage=cfg.get('min_attendance_percentage', 0),
                max_attendance_percentage=cfg.get('max_attendance_percentage', 100),
            ))
        return await self.attendance_marks_setups.update_with_configs(entity_id, entity)
