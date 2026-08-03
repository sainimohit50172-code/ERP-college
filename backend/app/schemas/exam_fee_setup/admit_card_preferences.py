from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AdmitCardPreferencesUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    fee_check: bool = Field(alias="feeCheck", default=False)
    attendance_check: bool = Field(alias="attendanceCheck", default=False)
    library_check: bool = Field(alias="libraryCheck", default=False)
    feedback_check: bool = Field(alias="feedbackCheck", default=False)
    updated_by: Optional[int] = Field(alias="updatedBy", default=None)


class AdmitCardPreferencesDetail(AdmitCardPreferencesUpdate):
    id: Optional[int] = None
    created_by: Optional[int] = Field(alias="createdBy", default=None)
    created_at: Optional[datetime] = Field(alias="createdAt", default=None)
    updated_at: Optional[datetime] = Field(alias="updatedAt", default=None)
