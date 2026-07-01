from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WarehouseBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    location: Optional[str] = Field(default=None, max_length=200)
    capacity: int = Field(default=0, ge=0)
    status: str = Field(default="active", max_length=20)


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseUpdate(WarehouseBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    capacity: Optional[int] = Field(default=None, ge=0)


class WarehouseDetail(WarehouseBase):
    id: int
    created_at: Optional[datetime] = None


class WarehouseListItem(WarehouseBase):
    id: int


class WarehouseResponse(WarehouseBase):
    id: int


class InventoryItemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    category: Optional[str] = Field(default=None, max_length=100)
    unit_price: Decimal = Field(gt=0)
    reorder_level: int = Field(default=0, ge=0)


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemUpdate(InventoryItemBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    unit_price: Optional[Decimal] = Field(default=None, gt=0)
    reorder_level: Optional[int] = Field(default=None, ge=0)


class InventoryItemDetail(InventoryItemBase):
    id: int
    created_at: Optional[datetime] = None


class InventoryItemListItem(InventoryItemBase):
    id: int


class InventoryItemResponse(InventoryItemBase):
    id: int


class StockBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inventory_item_id: int
    warehouse_id: int
    quantity: int = Field(default=0, ge=0)


class StockCreate(StockBase):
    pass


class StockUpdate(StockBase):
    inventory_item_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    quantity: Optional[int] = Field(default=None, ge=0)


class StockDetail(StockBase):
    id: int
    created_at: Optional[datetime] = None


class StockListItem(StockBase):
    id: int


class StockResponse(StockBase):
    id: int


class StockMovementBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    inventory_item_id: int
    warehouse_id: int
    movement_type: str = Field(min_length=1, max_length=50)
    quantity: int = Field(gt=0)
    movement_date: date


class StockMovementCreate(StockMovementBase):
    pass


class StockMovementUpdate(StockMovementBase):
    inventory_item_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    quantity: Optional[int] = Field(default=None, gt=0)
    movement_date: Optional[date] = None


class StockMovementDetail(StockMovementBase):
    id: int
    created_at: Optional[datetime] = None


class StockMovementListItem(StockMovementBase):
    id: int


class StockMovementResponse(StockMovementBase):
    id: int


class AssetRegisterBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    category: Optional[str] = Field(default=None, max_length=100)
    purchase_date: date
    value: Decimal = Field(gt=0)
    status: str = Field(default="active", max_length=20)


class AssetRegisterCreate(AssetRegisterBase):
    pass


class AssetRegisterUpdate(AssetRegisterBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    purchase_date: Optional[date] = None
    value: Optional[Decimal] = Field(default=None, gt=0)


class AssetRegisterDetail(AssetRegisterBase):
    id: int
    created_at: Optional[datetime] = None


class AssetRegisterListItem(AssetRegisterBase):
    id: int


class AssetRegisterResponse(AssetRegisterBase):
    id: int
