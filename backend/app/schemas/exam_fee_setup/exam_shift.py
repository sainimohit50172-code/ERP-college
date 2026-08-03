from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class CoeExamShiftDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    shift_name: str = Field(alias="shiftName")
    start_time: str = Field(alias="startTime")
    end_time: str = Field(alias="endTime")
    status: str = Field(alias="status")
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)


class CoeExamShiftCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    shift_name: str = Field(alias="shiftName", min_length=1, max_length=160)
    start_time: str = Field(alias="startTime", min_length=4, max_length=16)
    end_time: str = Field(alias="endTime", min_length=4, max_length=16)
    status: Optional[str] = Field(alias="status", default="Active")

    @field_validator("shift_name")
    @classmethod
    def normalize_shift_name(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def validate_times(self) -> "CoeExamShiftCreate":
        from datetime import datetime as dt

        try:
            start = dt.strptime(self.start_time, "%H:%M")
            end = dt.strptime(self.end_time, "%H:%M")
        except ValueError:
            raise ValueError("Start time and end time must be valid HH:MM values.")

        if end <= start:
            raise ValueError("End time must be greater than start time.")
        return self

    @field_validator("status")
    @classmethod
    def normalize_status(cls, value: str) -> str:
        return value.strip().title()


class CoeExamShiftUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    shift_name: Optional[str] = Field(alias="shiftName", min_length=1, max_length=160)
    start_time: Optional[str] = Field(alias="startTime", min_length=4, max_length=16)
    end_time: Optional[str] = Field(alias="endTime", min_length=4, max_length=16)
    status: Optional[str] = Field(alias="status")

    @field_validator("shift_name")
    @classmethod
    def normalize_shift_name(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def validate_times(self) -> "CoeExamShiftUpdate":
        from datetime import datetime as dt

        if self.start_time is not None and self.end_time is not None:
            try:
                start = dt.strptime(self.start_time, "%H:%M")
                end = dt.strptime(self.end_time, "%H:%M")
            except ValueError:
                raise ValueError("Start time and end time must be valid HH:MM values.")
            if end <= start:
                raise ValueError("End time must be greater than start time.")
        return self

    @field_validator("status")
    @classmethod
    def normalize_status(cls, value: Optional[str]) -> Optional[str]:
        return value.strip().title() if value is not None else None
