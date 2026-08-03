from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeAdmitCardPreferences(Base):
    __tablename__ = "coe_admit_card_preferences"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fee_check: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    attendance_check: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    library_check: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feedback_check: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
