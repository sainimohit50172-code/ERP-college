from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, Enum, ForeignKey, JSON, String, Text, cast
from sqlalchemy.orm import Mapped, mapped_column, relationship, foreign

from app.db.database import Base
from app.db.types import CaseInsensitiveEnum


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    admission_no: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    dob: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(Enum("M", "F", "O", name="gender_enum"), nullable=True)
    class_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("academic_classes.id"), nullable=True)
    section_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("sections.id"), nullable=True)
    enrollment_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(CaseInsensitiveEnum("Active", "Alumni", "Withdrawn", name="student_status"), nullable=False, default="Active")
    contact: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    admission: Mapped[Optional["Admission"]] = relationship(
        back_populates="student",
        uselist=False,
        primaryjoin="foreign(cast(Student.admission_no, String)) == Admission.id",
        lazy="selectin",
    )
    academic_class: Mapped[Optional["AcademicClass"]] = relationship(back_populates="students", lazy="selectin")
    section: Mapped[Optional["Section"]] = relationship(back_populates="students", lazy="selectin")
    guardians: Mapped[list["Guardian"]] = relationship(back_populates="student", cascade="all, delete-orphan", lazy="selectin")
    attendance_records: Mapped[list["AttendanceRecord"]] = relationship(back_populates="student", lazy="selectin")
    exam_results: Mapped[list["ExamResult"]] = relationship(back_populates="student", lazy="selectin")
    hostel_allocations: Mapped[list["HostelAllocation"]] = relationship(back_populates="student", lazy="selectin")
    student_assignments: Mapped[list["StudentAssignment"]] = relationship(back_populates="student", lazy="selectin")
    fee_collections: Mapped[list["FeeCollection"]] = relationship(back_populates="student", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship(back_populates="student", lazy="selectin")
    created_by_user: Mapped[Optional["User"]] = relationship(back_populates="students_created", foreign_keys=[created_by], lazy="selectin")
    updated_by_user: Mapped[Optional["User"]] = relationship(back_populates="students_updated", foreign_keys=[updated_by], lazy="selectin")


class Guardian(Base):
    __tablename__ = "guardians"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    relation_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    contact: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    primary_contact: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="guardians", lazy="selectin")


class StudentAssignment(Base):
    __tablename__ = "student_assignments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    submitted: Mapped[Optional[bool]] = mapped_column(default=False, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="student_assignments", lazy="selectin")
