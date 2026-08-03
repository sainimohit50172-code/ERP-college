from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ExamCalendar(Base):
    __tablename__ = "exam_calendars"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    exam_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    academic_session: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    exam_type: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    exam_category: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="Upcoming", index=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    updated_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    deleted_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
