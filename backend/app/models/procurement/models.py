from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, DateTime, DECIMAL, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_person: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    purchase_orders: Mapped[list["PurchaseOrder"]] = relationship(back_populates="supplier", cascade="all, delete-orphan", lazy="selectin")


class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    request_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    department_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("departments.id"), nullable=True)
    requested_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(Enum("Pending", "Approved", "Rejected", name="purchase_request_status"), nullable=False, default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship back to Department (matches Department.purchase_requests)
    requested_for_department: Mapped[Optional["Department"]] = relationship(
        "Department",
        back_populates="purchase_requests",
        foreign_keys=[department_id],
        lazy="selectin",
    )


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    supplier_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("suppliers.id"), nullable=False)
    order_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    order_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    total_amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(Enum("Draft", "Approved", "Ordered", "Received", "Cancelled", name="purchase_order_status"), nullable=False, default="Draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    supplier: Mapped[Supplier] = relationship(back_populates="purchase_orders", lazy="selectin")
    item_requests: Mapped[list["ItemRequest"]] = relationship(back_populates="purchase_order", cascade="all, delete-orphan", lazy="selectin")


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    purchase_order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("purchase_orders.id"), nullable=False)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    purchase_order: Mapped[PurchaseOrder] = relationship(lazy="selectin")


class ItemRequest(Base):
    __tablename__ = "item_requests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    purchase_order_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("purchase_orders.id"), nullable=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(default=1, nullable=False)
    requested_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(Enum("Requested", "Approved", "Rejected", name="item_request_status"), nullable=False, default="Requested")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    purchase_order: Mapped[Optional[PurchaseOrder]] = relationship(back_populates="item_requests", lazy="selectin")


class GoodsReceipt(Base):
    __tablename__ = "goods_receipts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    purchase_order_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("purchase_orders.id"), nullable=False)
    received_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(Enum("Pending", "Received", name="goods_receipt_status"), nullable=False, default="Pending")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
