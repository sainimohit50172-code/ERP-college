from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class CoeFeeHeadGroup(Base):
    __tablename__ = "coe_fee_head_groups"
    __table_args__ = (
        UniqueConstraint("group_code", name="uq_coe_fee_head_groups_code"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    group_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    group_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active", index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    details: Mapped[list["CoeFeeHeadGroupDetail"]] = relationship(
        back_populates="group",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class CoeFeeHeadGroupDetail(Base):
    __tablename__ = "coe_fee_head_group_details"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fee_head_group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("coe_fee_head_groups.id"), nullable=False)
    fee_head_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("coe_fee_heads.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    group: Mapped[CoeFeeHeadGroup] = relationship(back_populates="details", lazy="selectin")
    fee_head: Mapped["CoeFeeHead"] = relationship(lazy="selectin")

    @property
    def fee_head_name(self) -> Optional[str]:
        return self.fee_head.fee_head_name if self.fee_head is not None else None
