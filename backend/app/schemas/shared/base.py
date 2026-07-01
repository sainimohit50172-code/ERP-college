from __future__ import annotations

from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, Field, EmailStr, field_validator

T = TypeVar("T")


class PaginationRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    sort_by: Optional[str] = Field(default=None)
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")


class PaginationResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    items: List[T]
    total: int = Field(default=0, ge=0)
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=100)
    pages: int = Field(default=0, ge=0)


class APIResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    success: bool = True
    message: str = "Success"
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    error: str
    detail: Optional[str] = None


class ValidationErrorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    error: str = "validation_error"
    details: List[dict[str, Any]] = Field(default_factory=list)


class SearchRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    query: str = Field(min_length=1)
    fields: Optional[List[str]] = Field(default=None)


class SearchResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)

    items: List[T]
    total: int = Field(default=0, ge=0)


class SortRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    field: str = Field(min_length=1)
    direction: str = Field(default="asc", pattern="^(asc|desc)$")


class FilterRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    field: str = Field(min_length=1)
    value: Any
    operator: str = Field(default="eq", pattern="^(eq|ne|gt|gte|lt|lte|in|contains)$")


class BulkOperationRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ids: List[int] = Field(min_length=1)
    operation: str = Field(min_length=1)
    reason: Optional[str] = None
