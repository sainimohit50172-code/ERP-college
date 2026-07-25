from __future__ import annotations

from typing import Generic, List, Optional

from app.repositories.interfaces.base import BaseRepository
from app.models.academic import (
    AcademicClass,
    AcademicYear,
    AssessmentConfig,
    AssessmentGradeSetup,
    Course,
    Department,
    Designation,
    Section,
    Semester,
    Subject,
)
from app.models.academic import AttendanceMarksSetup, AttendanceMarksConfig


class DepartmentRepository(BaseRepository[Department]):
    ...


class DesignationRepository(BaseRepository[Designation]):
    ...


class AcademicYearRepository(BaseRepository[AcademicYear]):
    ...


class SemesterRepository(BaseRepository[Semester]):
    ...


class CourseRepository(BaseRepository[Course]):
    ...


class SubjectRepository(BaseRepository[Subject]):
    ...


class AcademicClassRepository(BaseRepository[AcademicClass]):
    ...


class SectionRepository(BaseRepository[Section]):
    ...


class AssessmentGradeSetupRepository(BaseRepository[AssessmentGradeSetup]):
    ...


class AssessmentConfigRepository(BaseRepository[AssessmentConfig]):
    ...


class AttendanceMarksSetupRepository(BaseRepository[AttendanceMarksSetup]):
    async def create_with_configs(self, entity: AttendanceMarksSetup) -> AttendanceMarksSetup:
        ...

    async def update_with_configs(self, entity_id: int, entity: AttendanceMarksSetup) -> AttendanceMarksSetup:
        ...


class AssessmentGroupRepository(BaseRepository):
    async def create_with_items(self, entity) -> object:
        ...

    async def update_with_items(self, entity_id: int, entity) -> object:
        ...
