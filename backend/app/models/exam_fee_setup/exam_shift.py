from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeExamShift(Base):
    __tablename__ = "coe_exam_shifts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    shift_name: Mapped[str] = mapped_column(String(160), nullable=False, unique=True, index=True)
    start_time: Mapped[str] = mapped_column(String(16), nullable=False)
    end_time: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
