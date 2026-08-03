from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Boolean, Date, DateTime, DECIMAL, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ExamFormPreference(Base):
    __tablename__ = "exam_form_preferences"
    __table_args__ = (
        Index("ix_exam_form_preferences_session_institute_course", "academic_session", "institute", "course"),
        Index("ix_exam_form_preferences_exam_type_status", "exam_type", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    academic_session: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    institute: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    course: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    program: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    semester: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    exam_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    form_opening_date: Mapped[date] = mapped_column(Date, nullable=False)
    form_closing_date: Mapped[date] = mapped_column(Date, nullable=False)
    late_fee_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    late_fee_amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    without_late_fee: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    with_late_fee: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    maximum_subjects: Mapped[int] = mapped_column(nullable=False, default=8)
    minimum_subjects: Mapped[int] = mapped_column(nullable=False, default=1)
    allow_improvement: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allow_back_paper: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allow_reappear: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allow_practical_only: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    allow_theory_only: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    updated_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    updated_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class ExamFormHeaderFooter(Base):
    __tablename__ = "exam_form_headers_footers"
    __table_args__ = (
        Index("ix_exam_form_headers_footers_institute_exam_type", "institute", "exam_type"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    header_name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    header_html: Mapped[str] = mapped_column(Text, nullable=False)
    footer_html: Mapped[str] = mapped_column(Text, nullable=False)
    institute: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    exam_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    watermark: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    updated_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    updated_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
