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
    AssessmentGradeSetup,
    AssessmentConfig,
    AssessmentGroup,
    AssessmentGroupItem,
    AttendanceMarksSetup,
    AttendanceMarksConfig,
)
from app.repositories.interfaces.academic import (
    AcademicClassRepository,
    AcademicYearRepository,
    AssessmentConfigRepository,
    AssessmentGradeSetupRepository,
    CourseRepository,
    DepartmentRepository,
    DesignationRepository,
    SectionRepository,
    SemesterRepository,
    SubjectRepository,
    AttendanceMarksSetupRepository,
    AssessmentGroupRepository,
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


class MySQLAssessmentGradeSetupRepository(MySQLRepository[AssessmentGradeSetup], AssessmentGradeSetupRepository):
    def __init__(self, session):
        super().__init__(session, AssessmentGradeSetup)


class MySQLAssessmentConfigRepository(MySQLRepository[AssessmentConfig], AssessmentConfigRepository):
    def __init__(self, session):
        super().__init__(session, AssessmentConfig)


class MySQLAttendanceMarksSetupRepository(MySQLRepository[AttendanceMarksSetup], AttendanceMarksSetupRepository):
    def __init__(self, session):
        super().__init__(session, AttendanceMarksSetup)

    async def create_with_configs(self, entity: AttendanceMarksSetup) -> AttendanceMarksSetup:
        # entity.configs may contain AttendanceMarksConfig instances (unsaved)
        session = getattr(self, "session", None)
        if session is None:
            return await self.create(entity)
        session.add(entity)
        await self._commit()
        await self._refresh(entity)
        return entity

    async def update_with_configs(self, entity_id: int, entity: AttendanceMarksSetup) -> AttendanceMarksSetup:
        existing = await self.get_by_id(entity_id)
        if existing is None:
            raise Exception("Not found")
        # replace attributes and sync configs
        existing.name = entity.name
        # clear existing configs and add new ones
        existing.configs.clear()
        for cfg in getattr(entity, 'configs', []) or []:
            existing.configs.append(cfg)
        await self._commit()
        await self._refresh(existing)
        return existing


class MySQLAssessmentGroupRepository(MySQLRepository, AssessmentGroupRepository):
    def __init__(self, session):
        from app.models.academic import AssessmentGroup

        super().__init__(session, AssessmentGroup)

    async def create_with_items(self, entity):
        session = getattr(self, "session", None)
        if session is None:
            return await self.create(entity)
        session.add(entity)
        await self._commit()
        await self._refresh(entity)
        return entity

    async def update_with_items(self, entity_id: int, entity):
        existing = await self.get_by_id(entity_id)
        if existing is None:
            raise Exception("Not found")
        # update scalar fields
        for attr in ["name", "college_id", "course_id", "batch_id", "grade_setup_id", "weightage", "edit_result"]:
            if hasattr(entity, attr):
                setattr(existing, attr, getattr(entity, attr))
        # replace items
        existing.items.clear()
        for it in getattr(entity, 'items', []) or []:
            existing.items.append(it)
        await self._commit()
        await self._refresh(existing)
        return existing

    async def copy_group(self, entity_id: int) -> AssessmentGroup:
        """Create a duplicate of an AssessmentGroup with its items.

        The new group's name will be prefixed with 'Copy of '.
        """
        existing = await self.get_by_id(entity_id)
        if existing is None:
            raise Exception("Not found")

        # create a new instance and deep-copy items
        from app.models.academic import AssessmentGroup, AssessmentGroupItem

        new_group = AssessmentGroup(
            name=(f"Copy of {existing.name}" if existing.name else "Copy"),
            college_id=existing.college_id,
            course_id=existing.course_id,
            batch_id=existing.batch_id,
            grade_setup_id=existing.grade_setup_id,
            weightage=existing.weightage,
            edit_result=existing.edit_result,
        )

        for it in getattr(existing, 'items', []) or []:
            new_item = AssessmentGroupItem(
                assessment_name=it.assessment_name,
                assessment_model=it.assessment_model,
                display_name=it.display_name,
                sequence_no=it.sequence_no,
                result_declared=it.result_declared,
                include_in_total=it.include_in_total,
                display_value=it.display_value,
                show_graph=it.show_graph,
                passing_required=it.passing_required,
            )
            new_group.items.append(new_item)

        session = getattr(self, "session", None)
        if session is None:
            return await self.create(new_group)
        session.add(new_group)
        await self._commit()
        await self._refresh(new_group)
        return new_group
