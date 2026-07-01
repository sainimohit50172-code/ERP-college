from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Admission(Base):
    __tablename__ = "admissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    applicant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    applied_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(Enum("Applied", "Accepted", "Rejected", "Converted", name="admission_status"), nullable=False, default="Applied")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by_user: Mapped[Optional["User"]] = relationship(back_populates="admissions_created", foreign_keys=[created_by], lazy="selectin")
    updated_by_user: Mapped[Optional["User"]] = relationship(back_populates="admissions_updated", foreign_keys=[updated_by], lazy="selectin")
    student: Mapped[Optional["Student"]] = relationship(back_populates="admission", lazy="selectin")
