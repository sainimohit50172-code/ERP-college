from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class DmcStudentAppDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    name: str = Field(alias="name")
    prefix: Optional[str] = Field(alias="prefix", default=None)
    suffix: Optional[str] = Field(alias="suffix", default=None)
    start_number: int = Field(alias="startNumber")
    end_number: int = Field(alias="endNumber")
    current_number: int = Field(alias="currentNumber")
    description: Optional[str] = Field(alias="description", default=None)
    status: str = Field(alias="status")
    generation_type: str = Field(alias="generationType")
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
    deleted_at: Optional[datetime] = Field(alias="deletedAt", default=None)


class DmcStudentAppCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: str = Field(alias="name", min_length=1, max_length=160)
    prefix: Optional[str] = Field(alias="prefix", default=None, max_length=32)
    suffix: Optional[str] = Field(alias="suffix", default=None, max_length=32)
    start_number: int = Field(alias="startNumber", ge=1)
    end_number: int = Field(alias="endNumber", ge=1)
    current_number: Optional[int] = Field(alias="currentNumber", default=None, ge=1)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: str = Field(alias="status", default="Active")
    generation_type: str = Field(alias="generationType", default="Sequence")

    @field_validator("name", "prefix", "suffix", "status", "generation_type", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        allowed = {"Active", "Inactive", "Draft"}
        if value not in allowed:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value

    @field_validator("generation_type")
    @classmethod
    def validate_generation_type(cls, value: str) -> str:
        allowed = {"Sequence", "Random"}
        if value not in allowed:
            raise ValueError("Generation Type must be Sequence or Random")
        return value

    @model_validator(mode="after")
    def validate_numbers(self) -> "DmcStudentAppCreate":
        if self.end_number < self.start_number:
            raise ValueError("End Number must be greater than or equal to Start Number.")
        if self.current_number is None:
            self.current_number = self.start_number
        if self.current_number < self.start_number or self.current_number > self.end_number:
            raise ValueError("Current Number must be between Start Number and End Number.")
        return self


class DmcStudentAppUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    name: Optional[str] = Field(alias="name", default=None, min_length=1, max_length=160)
    prefix: Optional[str] = Field(alias="prefix", default=None, max_length=32)
    suffix: Optional[str] = Field(alias="suffix", default=None, max_length=32)
    start_number: Optional[int] = Field(alias="startNumber", default=None, ge=1)
    end_number: Optional[int] = Field(alias="endNumber", default=None, ge=1)
    current_number: Optional[int] = Field(alias="currentNumber", default=None, ge=1)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: Optional[str] = Field(alias="status", default=None)
    generation_type: Optional[str] = Field(alias="generationType", default=None)

    @field_validator("name", "prefix", "suffix", "status", "generation_type", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        allowed = {"Active", "Inactive", "Draft"}
        if value not in allowed:
            raise ValueError("Status must be Active, Inactive, or Draft")
        return value

    @field_validator("generation_type")
    @classmethod
    def validate_generation_type(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        allowed = {"Sequence", "Random"}
        if value not in allowed:
            raise ValueError("Generation Type must be Sequence or Random")
        return value

    @model_validator(mode="after")
    def validate_numbers(self) -> "DmcStudentAppUpdate":
        if self.start_number is not None and self.end_number is not None and self.end_number < self.start_number:
            raise ValueError("End Number must be greater than or equal to Start Number.")
        if self.current_number is not None and self.start_number is not None and self.current_number < self.start_number:
            raise ValueError("Current Number must be at least Start Number.")
        if self.current_number is not None and self.end_number is not None and self.current_number > self.end_number:
            raise ValueError("Current Number must be less than or equal to End Number.")
        return self


class DmcStudentAppGlobalDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    enabled: bool = Field(alias="enabled")
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class DmcStudentAppGlobalUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    enabled: bool = Field(alias="enabled")
