from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CoeManageBundleDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    bundle_name: str = Field(alias="bundleName")
    bundle_code: str = Field(alias="bundleCode")
    bundle_type: str = Field(alias="bundleType")
    description: Optional[str] = Field(alias="description", default=None)
    status: str = Field(alias="status")
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
    deleted_at: Optional[datetime] = Field(alias="deletedAt", default=None)


class CoeManageBundleCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    bundle_name: str = Field(alias="bundleName", min_length=1, max_length=160)
    bundle_code: str = Field(alias="bundleCode", min_length=1, max_length=64)
    bundle_type: str = Field(alias="bundleType", default="Standard", min_length=1, max_length=64)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: str = Field(alias="status", default="Active")
    created_by: Optional[int] = Field(alias="createdBy", default=None)

    @field_validator("bundle_name", "bundle_code", "bundle_type", "status", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in {"Active", "Inactive", "Draft"}:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value

    @field_validator("bundle_type")
    @classmethod
    def validate_bundle_type(cls, value: str) -> str:
        if not value:
            return "Standard"
        return value


class CoeManageBundleUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    bundle_name: Optional[str] = Field(alias="bundleName", default=None, min_length=1, max_length=160)
    bundle_code: Optional[str] = Field(alias="bundleCode", default=None, min_length=1, max_length=64)
    bundle_type: Optional[str] = Field(alias="bundleType", default=None, min_length=1, max_length=64)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: Optional[str] = Field(alias="status", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)

    @field_validator("bundle_name", "bundle_code", "bundle_type", "status", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        if value not in {"Active", "Inactive", "Draft"}:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value

    @field_validator("bundle_type")
    @classmethod
    def validate_bundle_type(cls, value: Optional[str]) -> Optional[str]:
        return value or None
