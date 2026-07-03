from __future__ import annotations

from typing import Generic, List, Optional

from app.repositories.interfaces.base import BaseRepository
from app.models.academic import (
    Department,
    Designation,
    AcademicYear,
    Semester,
    Course,
    Subject,
    AcademicClass,
    Section,
)


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
