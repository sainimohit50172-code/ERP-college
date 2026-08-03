from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ReceiptConfigurationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    prefix: Optional[str] = Field(default=None, max_length=32)
    receipt_number: int = Field(alias="receiptNumber", ge=0)
    suffix: Optional[str] = Field(default=None, max_length=32)
    status: str = Field(default="Active", max_length=32)

    @field_validator("prefix", "suffix", mode="before")
    @classmethod
    def clean_optional_text(cls, value):
        if value is None:
            return None
        value = str(value).strip()
        return value or None


class ReceiptConfigurationCreate(ReceiptConfigurationBase):
    created_by: Optional[int] = Field(alias="createdBy", default=None)


class ReceiptConfigurationUpdate(ReceiptConfigurationBase):
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class ReceiptConfigurationDetail(ReceiptConfigurationBase):
    id: Optional[int] = None
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
