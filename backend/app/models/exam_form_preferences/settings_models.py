from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeExamFormPreferenceSetting(Base):
    __tablename__ = "coe_exam_form_preference_settings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_awake_status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    auto_approve: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    personal_details_check: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    exam_calendar_mode: Mapped[str] = mapped_column(String(32), nullable=False, default="Draft")
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class CoeExamFormPreference(Base):
    __tablename__ = "coe_exam_form_preferences"
    __table_args__ = (
        Index("uq_coe_exam_form_preferences_combination", "academic_session_id", "institute_id", "course_id", "program_id", "semester_id", "exam_type_id", unique=True),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    academic_session_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("academic_years.id"), nullable=False)
    institute_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    course_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("courses.id"), nullable=False)
    program_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    semester_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("semesters.id"), nullable=False)
    exam_type_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
