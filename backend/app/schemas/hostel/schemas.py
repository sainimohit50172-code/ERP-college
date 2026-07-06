from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class HostelBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    address: Optional[str] = None
    capacity: int = Field(default=0, ge=0)
    status: str = Field(default="active", max_length=20)


class HostelCreate(HostelBase):
    pass


class HostelUpdate(HostelBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    capacity: Optional[int] = Field(default=None, ge=0)


class HostelDetail(HostelBase):
    id: int
    created_at: Optional[datetime] = None


class HostelListItem(HostelBase):
    id: int


class HostelResponse(HostelBase):
    id: int


class RoomBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hostel_id: int
    room_number: str = Field(min_length=1, max_length=50)
    capacity: int = Field(default=0, ge=0)
    # Additional classroom metadata supported by the UI
    building: Optional[str] = None
    floor: Optional[str] = None
    has_projector: bool = Field(default=False)
    has_lab: bool = Field(default=False)
    has_ac: bool = Field(default=False)
    status: str = Field(default="Active", max_length=20)


class RoomCreate(RoomBase):
    pass


class RoomUpdate(RoomBase):
    hostel_id: Optional[int] = None
    room_number: Optional[str] = Field(default=None, min_length=1, max_length=50)
    capacity: Optional[int] = Field(default=None, ge=0)
    building: Optional[str] = None
    floor: Optional[str] = None
    has_projector: Optional[bool] = None
    has_lab: Optional[bool] = None
    has_ac: Optional[bool] = None


class RoomDetail(RoomBase):
    id: int
    created_at: Optional[datetime] = None


class RoomListItem(RoomBase):
    id: int


class RoomResponse(RoomBase):
    id: int


class BedBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    room_id: int
    bed_number: str = Field(min_length=1, max_length=50)
    status: str = Field(default="available", max_length=20)


class BedCreate(BedBase):
    pass


class BedUpdate(BedBase):
    room_id: Optional[int] = None
    bed_number: Optional[str] = Field(default=None, min_length=1, max_length=50)


class BedDetail(BedBase):
    id: int
    created_at: Optional[datetime] = None


class BedListItem(BedBase):
    id: int


class BedResponse(BedBase):
    id: int


class HostelAllocationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    room_id: int
    allocation_date: date
    status: str = Field(default="active", max_length=20)


class HostelAllocationCreate(HostelAllocationBase):
    pass


class HostelAllocationUpdate(HostelAllocationBase):
    student_id: Optional[int] = None
    room_id: Optional[int] = None
    allocation_date: Optional[date] = None


class HostelAllocationDetail(HostelAllocationBase):
    id: int
    created_at: Optional[datetime] = None


class HostelAllocationListItem(HostelAllocationBase):
    id: int


class HostelAllocationResponse(HostelAllocationBase):
    id: int


class VisitorBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hostel_id: int
    visitor_name: str = Field(min_length=1, max_length=200)
    phone: Optional[str] = Field(default=None, max_length=20)
    visit_date: date
    purpose: Optional[str] = None


class VisitorCreate(VisitorBase):
    pass


class VisitorUpdate(VisitorBase):
    hostel_id: Optional[int] = None
    visitor_name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    visit_date: Optional[date] = None


class VisitorDetail(VisitorBase):
    id: int
    created_at: Optional[datetime] = None


class VisitorListItem(VisitorBase):
    id: int


class VisitorResponse(VisitorBase):
    id: int


class ComplaintBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    complaint: str = Field(min_length=1, max_length=1000)
    status: str = Field(default="open", max_length=20)
    complaint_date: date


class ComplaintCreate(ComplaintBase):
    pass


class ComplaintUpdate(ComplaintBase):
    student_id: Optional[int] = None
    complaint: Optional[str] = Field(default=None, min_length=1, max_length=1000)
    complaint_date: Optional[date] = None


class ComplaintDetail(ComplaintBase):
    id: int
    created_at: Optional[datetime] = None


class ComplaintListItem(ComplaintBase):
    id: int


class ComplaintResponse(ComplaintBase):
    id: int
