from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FeeCategoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    amount: Decimal = Field(default=0, gt=0)


class FeeCategoryCreate(FeeCategoryBase):
    pass


class FeeCategoryUpdate(FeeCategoryBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    amount: Optional[Decimal] = Field(default=None, gt=0)


class FeeCategoryDetail(FeeCategoryBase):
    id: int
    created_at: Optional[datetime] = None


class FeeCategoryListItem(FeeCategoryBase):
    id: int


class FeeCategoryResponse(FeeCategoryBase):
    id: int


class FeeCollectionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    fee_category_id: int
    amount_paid: Decimal = Field(gt=0)
    payment_date: date
    status: str = Field(default="paid", max_length=20)


class FeeCollectionCreate(FeeCollectionBase):
    pass


class FeeCollectionUpdate(FeeCollectionBase):
    student_id: Optional[int] = None
    fee_category_id: Optional[int] = None
    amount_paid: Optional[Decimal] = Field(default=None, gt=0)
    payment_date: Optional[date] = None


class FeeCollectionDetail(FeeCollectionBase):
    id: int
    created_at: Optional[datetime] = None


class FeeCollectionListItem(FeeCollectionBase):
    id: int


class FeeCollectionResponse(FeeCollectionBase):
    id: int
