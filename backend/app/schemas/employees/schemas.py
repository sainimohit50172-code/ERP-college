from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_code: str = Field(min_length=1, max_length=50)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    designation: Optional[str] = Field(default=None, max_length=100)
    department: Optional[str] = Field(default=None, max_length=100)
    status: str = Field(default="Active", max_length=20)


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(EmployeeBase):
    employee_code: Optional[str] = Field(default=None, min_length=1, max_length=50)
    first_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class EmployeeDetail(EmployeeBase):
    id: int
    created_at: Optional[datetime] = None


class EmployeeListItem(EmployeeBase):
    id: int
    # Allow nullable last_name for list views to tolerate incomplete DB records
    last_name: Optional[str] = Field(default=None, min_length=1, max_length=100)


class EmployeeResponse(EmployeeBase):
    id: int


class LeaveGroupBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    annual_allocation_days: Optional[int] = Field(default=None, ge=0)
    carry_forward_days: Optional[int] = Field(default=None, ge=0)
    status: str = Field(default="Active", max_length=32)


class LeaveGroupCreate(LeaveGroupBase):
    pass


class LeaveGroupUpdate(LeaveGroupBase):
    code: Optional[str] = Field(default=None, min_length=1, max_length=64)
    name: Optional[str] = Field(default=None, min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    annual_allocation_days: Optional[int] = Field(default=None, ge=0)
    carry_forward_days: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, max_length=32)


class LeaveGroupDetail(LeaveGroupBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LeaveGroupListItem(LeaveGroupBase):
    id: int


class LeaveCycleBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    start_month: int = Field(ge=1, le=12, default=1)
    end_month: int = Field(ge=1, le=12, default=12)
    status: str = Field(default="Active", max_length=32)


class LeaveCycleCreate(LeaveCycleBase):
    pass


class LeaveCycleUpdate(LeaveCycleBase):
    code: Optional[str] = Field(default=None, min_length=1, max_length=64)
    name: Optional[str] = Field(default=None, min_length=1, max_length=128)
    description: Optional[str] = Field(default=None, max_length=2000)
    start_month: Optional[int] = Field(default=None, ge=1, le=12)
    end_month: Optional[int] = Field(default=None, ge=1, le=12)
    status: Optional[str] = Field(default=None, max_length=32)


class LeaveCycleDetail(LeaveCycleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LeaveCycleListItem(LeaveCycleBase):
    id: int


class LeavePreferenceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: Optional[int] = Field(default=None, ge=1)
    leave_group_id: Optional[int] = Field(default=None, ge=1)
    leave_cycle_id: Optional[int] = Field(default=None, ge=1)
    preferred_leave_type: Optional[str] = Field(default=None, max_length=64)
    carry_forward_limit: Optional[int] = Field(default=None, ge=0)
    special_leave_days: Optional[int] = Field(default=None, ge=0)
    status: str = Field(default="Active", max_length=32)
    notes: Optional[str] = Field(default=None, max_length=2000)


class LeavePreferenceCreate(LeavePreferenceBase):
    pass


class LeavePreferenceUpdate(LeavePreferenceBase):
    employee_id: Optional[int] = Field(default=None, ge=1)
    leave_group_id: Optional[int] = Field(default=None, ge=1)
    leave_cycle_id: Optional[int] = Field(default=None, ge=1)
    preferred_leave_type: Optional[str] = Field(default=None, max_length=64)
    carry_forward_limit: Optional[int] = Field(default=None, ge=0)
    special_leave_days: Optional[int] = Field(default=None, ge=0)
    status: Optional[str] = Field(default=None, max_length=32)
    notes: Optional[str] = Field(default=None, max_length=2000)


class LeavePreferenceDetail(LeavePreferenceBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LeavePreferenceListItem(LeavePreferenceBase):
    id: int
