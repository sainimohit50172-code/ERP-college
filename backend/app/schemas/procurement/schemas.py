from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SupplierBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    contact_person: Optional[str] = Field(default=None, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=20)
    email: Optional[str] = Field(default=None, max_length=200)
    status: str = Field(default="active", max_length=20)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=20)


class SupplierDetail(SupplierBase):
    id: int
    created_at: Optional[datetime] = None


class SupplierListItem(SupplierBase):
    id: int


class SupplierResponse(SupplierBase):
    id: int


class PurchaseRequestBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    requested_by: int
    item_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(gt=0)
    status: str = Field(default="pending", max_length=20)
    requested_on: date


class PurchaseRequestCreate(PurchaseRequestBase):
    pass


class PurchaseRequestUpdate(PurchaseRequestBase):
    requested_by: Optional[int] = None
    item_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    quantity: Optional[int] = Field(default=None, gt=0)
    requested_on: Optional[date] = None


class PurchaseRequestDetail(PurchaseRequestBase):
    id: int
    created_at: Optional[datetime] = None


class PurchaseRequestListItem(PurchaseRequestBase):
    id: int


class PurchaseRequestResponse(PurchaseRequestBase):
    id: int


class PurchaseOrderBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    purchase_request_id: int
    supplier_id: int
    order_date: date
    status: str = Field(default="draft", max_length=20)


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(PurchaseOrderBase):
    purchase_request_id: Optional[int] = None
    supplier_id: Optional[int] = None
    order_date: Optional[date] = None


class PurchaseOrderDetail(PurchaseOrderBase):
    id: int
    created_at: Optional[datetime] = None


class PurchaseOrderListItem(PurchaseOrderBase):
    id: int


class PurchaseOrderResponse(PurchaseOrderBase):
    id: int


class PurchaseOrderLineBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    purchase_order_id: int
    item_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(gt=0)


class PurchaseOrderLineCreate(PurchaseOrderLineBase):
    pass


class PurchaseOrderLineUpdate(PurchaseOrderLineBase):
    purchase_order_id: Optional[int] = None
    item_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    quantity: Optional[int] = Field(default=None, gt=0)
    unit_price: Optional[Decimal] = Field(default=None, gt=0)


class PurchaseOrderLineDetail(PurchaseOrderLineBase):
    id: int
    created_at: Optional[datetime] = None


class PurchaseOrderLineListItem(PurchaseOrderLineBase):
    id: int


class PurchaseOrderLineResponse(PurchaseOrderLineBase):
    id: int


class GoodsReceiptBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    purchase_order_id: int
    received_date: date
    status: str = Field(default="received", max_length=20)


class GoodsReceiptCreate(GoodsReceiptBase):
    pass


class GoodsReceiptUpdate(GoodsReceiptBase):
    purchase_order_id: Optional[int] = None
    received_date: Optional[date] = None


class GoodsReceiptDetail(GoodsReceiptBase):
    id: int
    created_at: Optional[datetime] = None


class GoodsReceiptListItem(GoodsReceiptBase):
    id: int


class GoodsReceiptResponse(GoodsReceiptBase):
    id: int
