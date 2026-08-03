from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeReceiptConfiguration(Base):
    __tablename__ = "coe_receipt_configuration"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prefix: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    receipt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    suffix: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
