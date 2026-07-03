from __future__ import annotations

from typing import Generic, List, Optional

from app.repositories.mysql.base import MySQLRepository
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


class MySQLDepartmentRepository(MySQLRepository[Department], DepartmentRepository):
    def __init__(self, session):
        super().__init__(session, Department)


class MySQLDesignationRepository(MySQLRepository[Designation], DesignationRepository):
    def __init__(self, session):
        super().__init__(session, Designation)


class MySQLAcademicYearRepository(MySQLRepository[AcademicYear], AcademicYearRepository):
    def __init__(self, session):
        super().__init__(session, AcademicYear)


class MySQLSemesterRepository(MySQLRepository[Semester], SemesterRepository):
    def __init__(self, session):
        super().__init__(session, Semester)


class MySQLCourseRepository(MySQLRepository[Course], CourseRepository):
    def __init__(self, session):
        super().__init__(session, Course)


class MySQLSubjectRepository(MySQLRepository[Subject], SubjectRepository):
    def __init__(self, session):
        super().__init__(session, Subject)


class MySQLAcademicClassRepository(MySQLRepository[AcademicClass], AcademicClassRepository):
    def __init__(self, session):
        super().__init__(session, AcademicClass)


class MySQLSectionRepository(MySQLRepository[Section], SectionRepository):
    def __init__(self, session):
        super().__init__(session, Section)
