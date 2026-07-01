from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RouteBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    start_point: str = Field(min_length=1, max_length=100)
    end_point: str = Field(min_length=1, max_length=100)
    status: str = Field(default="active", max_length=20)


class RouteCreate(RouteBase):
    pass


class RouteUpdate(RouteBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    start_point: Optional[str] = Field(default=None, min_length=1, max_length=100)
    end_point: Optional[str] = Field(default=None, min_length=1, max_length=100)


class RouteDetail(RouteBase):
    id: int
    created_at: Optional[datetime] = None


class RouteListItem(RouteBase):
    id: int


class RouteResponse(RouteBase):
    id: int


class VehicleBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_number: str = Field(min_length=1, max_length=50)
    vehicle_type: str = Field(min_length=1, max_length=50)
    capacity: int = Field(default=0, ge=0)
    status: str = Field(default="active", max_length=20)


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(VehicleBase):
    vehicle_number: Optional[str] = Field(default=None, min_length=1, max_length=50)
    vehicle_type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    capacity: Optional[int] = Field(default=None, ge=0)


class VehicleDetail(VehicleBase):
    id: int
    created_at: Optional[datetime] = None


class VehicleListItem(VehicleBase):
    id: int


class VehicleResponse(VehicleBase):
    id: int


class TransportAssignmentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    route_id: int
    vehicle_id: int
    assignment_date: date
    status: str = Field(default="assigned", max_length=20)


class TransportAssignmentCreate(TransportAssignmentBase):
    pass


class TransportAssignmentUpdate(TransportAssignmentBase):
    student_id: Optional[int] = None
    route_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    assignment_date: Optional[date] = None


class TransportAssignmentDetail(TransportAssignmentBase):
    id: int
    created_at: Optional[datetime] = None


class TransportAssignmentListItem(TransportAssignmentBase):
    id: int


class TransportAssignmentResponse(TransportAssignmentBase):
    id: int
