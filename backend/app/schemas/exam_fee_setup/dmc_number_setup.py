from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class DmcNumberSetupDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    series_name: str = Field(alias="seriesName")
    prefix: Optional[str] = Field(alias="prefix", default=None)
    starting_number: int = Field(alias="startingNumber")
    ending_number: int = Field(alias="endingNumber")
    current_number: int = Field(alias="currentNumber")
    digit_length: int = Field(alias="digitLength")
    description: Optional[str] = Field(alias="description", default=None)
    status: str = Field(alias="status")
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
    deleted_at: Optional[datetime] = Field(alias="deletedAt", default=None)


class DmcNumberSetupCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    series_name: str = Field(alias="seriesName", min_length=1, max_length=160)
    prefix: Optional[str] = Field(alias="prefix", default=None, max_length=32)
    starting_number: int = Field(alias="startingNumber", ge=1)
    ending_number: int = Field(alias="endingNumber", ge=1)
    current_number: Optional[int] = Field(alias="currentNumber", default=None, ge=1)
    digit_length: int = Field(alias="digitLength", ge=1, le=20)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: str = Field(alias="status", default="Active")

    @field_validator("series_name", "prefix", "status", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        allowed = {"Active", "Inactive"}
        if value not in allowed:
            raise ValueError("Status must be Active or Inactive")
        return value

    @model_validator(mode="after")
    def validate_numbers(self) -> "DmcNumberSetupCreate":
        if self.ending_number < self.starting_number:
            raise ValueError("Ending Number must be greater than or equal to Starting Number.")
        if self.current_number is None:
            self.current_number = self.starting_number
        if self.current_number < self.starting_number or self.current_number > self.ending_number:
            raise ValueError("Current Number must be between Starting Number and Ending Number.")
        return self


class DmcNumberSetupUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    series_name: Optional[str] = Field(alias="seriesName", default=None, min_length=1, max_length=160)
    prefix: Optional[str] = Field(alias="prefix", default=None, max_length=32)
    starting_number: Optional[int] = Field(alias="startingNumber", default=None, ge=1)
    ending_number: Optional[int] = Field(alias="endingNumber", default=None, ge=1)
    current_number: Optional[int] = Field(alias="currentNumber", default=None, ge=1)
    digit_length: Optional[int] = Field(alias="digitLength", default=None, ge=1, le=20)
    description: Optional[str] = Field(alias="description", default=None, max_length=4000)
    status: Optional[str] = Field(alias="status", default=None)

    @field_validator("series_name", "prefix", "status", mode="before")
    @classmethod
    def trim_text(cls, value: Optional[str]) -> Optional[str]:
        return str(value).strip() if value is not None else value

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        allowed = {"Active", "Inactive"}
        if value not in allowed:
            raise ValueError("Status must be Active or Inactive")
        return value

    @model_validator(mode="after")
    def validate_numbers(self) -> "DmcNumberSetupUpdate":
        if self.starting_number is not None and self.ending_number is not None:
            if self.ending_number < self.starting_number:
                raise ValueError("Ending Number must be greater than or equal to Starting Number.")
        if self.current_number is not None:
            if self.starting_number is not None and self.current_number < self.starting_number:
                raise ValueError("Current Number must be >= Starting Number.")
            if self.ending_number is not None and self.current_number > self.ending_number:
                raise ValueError("Current Number must be <= Ending Number.")
        return self
