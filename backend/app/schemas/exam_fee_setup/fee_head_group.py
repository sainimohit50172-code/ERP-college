from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FeeHeadGroupBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    group_name: str = Field(alias="groupName", min_length=1, max_length=255)
    group_code: str = Field(alias="groupCode", min_length=1, max_length=64)
    status: str = Field(default="Active")
    description: Optional[str] = Field(default=None, max_length=4000)

    @field_validator("group_name", "group_code", mode="before")
    @classmethod
    def trim_required(cls, value):
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        if value not in {"Active", "Inactive", "Draft"}:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value


class FeeHeadGroupDetailCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(min_length=1, max_length=255)
    fee_head_id: int = Field(alias="feeHeadId")
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class FeeHeadGroupDetailItem(FeeHeadGroupDetailCreate):
    id: int
    fee_head_name: Optional[str] = Field(alias="feeHeadName", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class FeeHeadGroupCreate(FeeHeadGroupBase):
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    details: Optional[list[FeeHeadGroupDetailCreate]] = Field(default_factory=list)


class FeeHeadGroupUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    group_name: Optional[str] = Field(alias="groupName", default=None, min_length=1, max_length=255)
    group_code: Optional[str] = Field(alias="groupCode", default=None, min_length=1, max_length=64)
    status: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None, max_length=4000)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    details: Optional[list[FeeHeadGroupDetailCreate]] = None


class FeeHeadGroupDetail(FeeHeadGroupBase):
    id: int
    details: list[FeeHeadGroupDetailItem] = []
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
