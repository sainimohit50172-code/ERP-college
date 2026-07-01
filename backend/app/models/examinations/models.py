from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, DECIMAL, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    term: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    exam_results: Mapped[list["ExamResult"]] = relationship(back_populates="exam", cascade="all, delete-orphan", lazy="selectin")


class ExamResult(Base):
    __tablename__ = "exam_results"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exam_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("exams.id"), nullable=False)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    subject_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("subjects.id"), nullable=True)
    marks: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(7, 2), nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(8), nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    exam: Mapped[Exam] = relationship(back_populates="exam_results", lazy="selectin")
    student: Mapped["Student"] = relationship(back_populates="exam_results", lazy="selectin")
    subject: Mapped[Optional["Subject"]] = relationship(back_populates="exam_results", lazy="selectin")
