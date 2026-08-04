from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class DmcNumberSetup(Base):
    __tablename__ = "coe_dmc_number_setup"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    series_name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    prefix: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    starting_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    ending_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    current_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    digit_length: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
