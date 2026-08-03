from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FeeHeadBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    fee_head_name: str = Field(alias="feeHeadName", min_length=1, max_length=160)
    fee_head_code: str = Field(alias="feeHeadCode", min_length=1, max_length=64)
    receipt_head: str = Field(alias="receiptHead", min_length=1, max_length=160)
    fee_category: str = Field(alias="feeCategory", min_length=1, max_length=120)
    display_order: int = Field(alias="displayOrder", ge=0)
    amount_type: str = Field(alias="amountType", default="Fixed")
    is_refundable: bool = Field(alias="isRefundable", default=False)
    tax_applicable: bool = Field(alias="taxApplicable", default=False)
    status: str = Field(default="Active")
    description: Optional[str] = Field(default=None, max_length=4000)

    @field_validator("fee_head_name", "fee_head_code", "receipt_head", "fee_category", mode="before")
    @classmethod
    def trim_required(cls, value):
        return str(value).strip() if value is not None else value

    @field_validator("amount_type")
    @classmethod
    def validate_amount_type(cls, value):
        if value not in {"Fixed", "Variable"}:
            raise ValueError("Amount type must be Fixed or Variable")
        return value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value not in {"Active", "Inactive", "Draft"}:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value


class FeeHeadCreate(FeeHeadBase):
    created_by: Optional[int] = Field(alias="createdBy", default=None)


class FeeHeadUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    fee_head_name: Optional[str] = Field(alias="feeHeadName", default=None, min_length=1, max_length=160)
    fee_head_code: Optional[str] = Field(alias="feeHeadCode", default=None, min_length=1, max_length=64)
    receipt_head: Optional[str] = Field(alias="receiptHead", default=None, min_length=1, max_length=160)
    fee_category: Optional[str] = Field(alias="feeCategory", default=None, min_length=1, max_length=120)
    display_order: Optional[int] = Field(alias="displayOrder", default=None, ge=0)
    amount_type: Optional[str] = Field(alias="amountType", default=None)
    is_refundable: Optional[bool] = Field(alias="isRefundable", default=None)
    tax_applicable: Optional[bool] = Field(alias="taxApplicable", default=None)
    status: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None, max_length=4000)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class FeeHeadDetail(FeeHeadBase):
    id: int
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
