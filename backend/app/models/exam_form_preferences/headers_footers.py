from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeExamFormHeaderFooter(Base):
    __tablename__ = "coe_exam_form_headers_footers"
    __table_args__ = (
        Index("uq_coe_exam_form_headers_footers_slot", "institute_id", "exam_type_id", "section_type", "template_type", unique=True),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    institute_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    exam_type_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    section_type: Mapped[str] = mapped_column(String(16), nullable=False)
    template_type: Mapped[str] = mapped_column(String(16), nullable=False)
    html_content: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
