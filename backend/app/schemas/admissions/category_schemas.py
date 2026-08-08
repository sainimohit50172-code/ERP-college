from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AdmissionCategoryBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    category_name: str = Field(alias="categoryName", min_length=1, max_length=255)
    status: str = Field(default="Active", max_length=50)
    description: Optional[str] = Field(alias="description", default=None, max_length=1024)


class AdmissionCategoryCreate(AdmissionCategoryBase):
    pass


class AdmissionCategoryUpdate(AdmissionCategoryBase):
    category_name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    status: Optional[str] = Field(default=None, max_length=50)


class AdmissionCategoryDetail(AdmissionCategoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class AdmissionCategoryListItem(AdmissionCategoryBase):
    id: int


class AdmissionCategoryResponse(AdmissionCategoryBase):
    id: int
