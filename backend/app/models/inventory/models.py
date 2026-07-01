from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, DateTime, DECIMAL, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    items: Mapped[list["InventoryItem"]] = relationship(back_populates="warehouse", cascade="all, delete-orphan", lazy="selectin")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    warehouse_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("warehouses.id"), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    warehouse: Mapped[Warehouse] = relationship(back_populates="items", lazy="selectin")
    stocks: Mapped[list["Stock"]] = relationship(back_populates="item", cascade="all, delete-orphan", lazy="selectin")


class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("inventory_items.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(default=0, nullable=False)
    reorder_level: Mapped[Optional[int]] = mapped_column(default=0, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    item: Mapped[InventoryItem] = relationship(back_populates="stocks", lazy="selectin")
    movements: Mapped[list["StockMovement"]] = relationship(back_populates="stock", cascade="all, delete-orphan", lazy="selectin")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    stock_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("stocks.id"), nullable=False)
    movement_type: Mapped[str] = mapped_column(Enum("In", "Out", "Adjustment", name="stock_movement_type"), nullable=False)
    quantity: Mapped[int] = mapped_column(default=0, nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    stock: Mapped[Stock] = relationship(back_populates="movements", lazy="selectin")


class AssetRegister(Base):
    __tablename__ = "asset_register"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    value: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    acquired_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
