from __future__ import annotations

from datetime import date, datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import BigInteger, Date, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.auth.models import User
    from app.models.employees.models import Employee
    from app.models.procurement.models import PurchaseRequest
    from app.models.finance.models import Budget
    from app.models.examinations.models import ExamResult
    from app.models.students.models import Student


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[Optional[str]] = mapped_column(String(32), unique=True, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=True,
    )

    updated_by: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey("users.id"),
        nullable=True,
    )

    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    created_by_user: Mapped[Optional["User"]] = relationship(
        back_populates="created_departments",
        foreign_keys=[created_by],
        lazy="selectin",
    )

    updated_by_user: Mapped[Optional["User"]] = relationship(
        back_populates="updated_departments",
        foreign_keys=[updated_by],
        lazy="selectin",
    )

    courses: Mapped[list["Course"]] = relationship(
        back_populates="department",
        lazy="selectin",
    )

    employees: Mapped[list["Employee"]] = relationship(
        back_populates="department",
        lazy="selectin",
    )

    purchase_requests: Mapped[list["PurchaseRequest"]] = relationship(
        back_populates="requested_for_department",
        lazy="selectin",
    )


class Designation(Base):
    __tablename__ = "designations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    level: Mapped[Optional[int]] = mapped_column(nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    employees: Mapped[list["Employee"]] = relationship(back_populates="designation", lazy="selectin")


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_active: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    semesters: Mapped[list["Semester"]] = relationship(back_populates="academic_year", cascade="all, delete-orphan", lazy="selectin")
    academic_classes: Mapped[list["AcademicClass"]] = relationship(back_populates="academic_year", lazy="selectin")
    budgets: Mapped[list["Budget"]] = relationship(back_populates="academic_year", lazy="selectin")


class Semester(Base):
    __tablename__ = "semesters"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("academic_years.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    academic_year: Mapped[AcademicYear] = relationship(back_populates="semesters", lazy="selectin")


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    department_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("departments.id"), nullable=True)
    credits: Mapped[Optional[int]] = mapped_column(nullable=True, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    department: Mapped[Optional[Department]] = relationship(back_populates="courses", lazy="selectin")
    subjects: Mapped[list["Subject"]] = relationship(back_populates="course", lazy="selectin")
    academic_classes: Mapped[list["AcademicClass"]] = relationship(back_populates="course", lazy="selectin")


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    course_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("courses.id"), nullable=True)
    credits: Mapped[Optional[int]] = mapped_column(nullable=True, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    course: Mapped[Optional[Course]] = relationship(back_populates="subjects", lazy="selectin")
    exam_results: Mapped[list["ExamResult"]] = relationship(back_populates="subject", lazy="selectin")


class AcademicClass(Base):
    __tablename__ = "academic_classes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    course_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("courses.id"), nullable=True)
    year_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("academic_years.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    course: Mapped[Optional[Course]] = relationship(back_populates="academic_classes", lazy="selectin")
    academic_year: Mapped[Optional[AcademicYear]] = relationship(back_populates="academic_classes", lazy="selectin")
    sections: Mapped[list["Section"]] = relationship(back_populates="academic_class", cascade="all, delete-orphan", lazy="selectin")
    students: Mapped[list["Student"]] = relationship(back_populates="academic_class", lazy="selectin")


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    class_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("academic_classes.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(64), nullable=False)
    capacity: Mapped[Optional[int]] = mapped_column(nullable=True)

    academic_class: Mapped[AcademicClass] = relationship(back_populates="sections", lazy="selectin")
    students: Mapped[list["Student"]] = relationship(back_populates="section", lazy="selectin")


class AssessmentGradeSetup(Base):
    __tablename__ = "assessment_grade_setups"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    grade_band: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    min_score: Mapped[Optional[int]] = mapped_column(nullable=True)
    max_score: Mapped[Optional[int]] = mapped_column(nullable=True)
    grade_point: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssessmentConfig(Base):
    __tablename__ = "assessment_configs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    assessment_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    key: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssessmentGroup(Base):
    __tablename__ = "assessment_group"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    college_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("departments.id"), nullable=True)
    course_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("courses.id"), nullable=True)
    batch_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("academic_classes.id"), nullable=True)
    grade_setup_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("assessment_grade_setups.id"), nullable=True)
    weightage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    edit_result: Mapped[bool] = mapped_column(nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    items: Mapped[list["AssessmentGroupItem"]] = relationship(back_populates="group", cascade="all, delete-orphan", lazy="selectin")


class AssessmentGroupItem(Base):
    __tablename__ = "assessment_group_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    assessment_group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("assessment_group.id"), nullable=False)
    assessment_name: Mapped[str] = mapped_column(String(255), nullable=False)
    assessment_model: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sequence_no: Mapped[Optional[int]] = mapped_column(nullable=True)
    result_declared: Mapped[bool] = mapped_column(nullable=False, default=False)
    include_in_total: Mapped[bool] = mapped_column(nullable=False, default=False)
    display_value: Mapped[bool] = mapped_column(nullable=False, default=False)
    show_graph: Mapped[bool] = mapped_column(nullable=False, default=False)
    passing_required: Mapped[bool] = mapped_column(nullable=False, default=False)

    group: Mapped[AssessmentGroup] = relationship(back_populates="items", lazy="selectin")


class AttendanceMarksSetup(Base):
    __tablename__ = "attendance_marks_setup"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    configs: Mapped[list["AttendanceMarksConfig"]] = relationship(back_populates="setup", cascade="all, delete-orphan", lazy="selectin")


class AttendanceMarksConfig(Base):
    __tablename__ = "attendance_marks_config"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    setup_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("attendance_marks_setup.id"), nullable=False)
    marks: Mapped[int] = mapped_column(nullable=False)
    max_attendance_percentage: Mapped[int] = mapped_column(nullable=False, default=100)
    min_attendance_percentage: Mapped[int] = mapped_column(nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    setup: Mapped[AttendanceMarksSetup] = relationship(back_populates="configs", lazy="selectin")
