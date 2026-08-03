from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class CoeFeeHead(Base):
    __tablename__ = "coe_fee_heads"
    __table_args__ = (
        UniqueConstraint("fee_head_code", name="uq_coe_fee_heads_code"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fee_head_name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    fee_head_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    receipt_head: Mapped[str] = mapped_column(String(160), nullable=False)
    fee_category: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    amount_type: Mapped[str] = mapped_column(String(32), nullable=False, default="Fixed")
    is_refundable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tax_applicable: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
