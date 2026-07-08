from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth.router import get_current_user
from app.db.database import get_db
from app.models.employees.models import Employee, LeaveRequest, LeaveType
from app.schemas.shared.base import APIResponse, PaginationResponse

router = APIRouter(tags=["leave"])


class LeaveTypePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    code: str
    name: str
    description: Optional[str] = None


class LeaveRequestPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    leave_type_id: int = Field(alias="leaveTypeId")
    start_date: date = Field(alias="startDate")
    end_date: date = Field(alias="endDate")
    days: float = Field(default=1.0)
    reason: Optional[str] = None
    status: Optional[str] = None


class LeaveRequestUpdatePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    status: Optional[str] = None
    reason: Optional[str] = None


DEFAULT_LEAVE_TYPES = [
    ("annual", "Annual Leave", "Annual leave for planned time off"),
    ("sick", "Sick Leave", "Leave for short-term illness"),
    ("casual", "Casual Leave", "Personal leave for urgent needs"),
    ("maternity", "Maternity Leave", "Leave for maternity related needs"),
]


def seed_default_leave_types(db: Session) -> list[LeaveType]:
    existing = db.scalars(select(LeaveType)).all()
    if existing:
        return existing

    created: list[LeaveType] = []
    for code, name, description in DEFAULT_LEAVE_TYPES:
        leave_type = LeaveType(code=code, name=name, description=description)
        db.add(leave_type)
        created.append(leave_type)

    db.commit()
    for item in created:
        db.refresh(item)
    return created


def _get_or_create_employee_for_user(db: Session, current_user: Any) -> Employee:
    employee = db.scalar(select(Employee).where(Employee.user_id == current_user.id))
    if employee is not None:
        return employee

    first_name = (current_user.full_name or current_user.username or current_user.email or "Employee").split()[0]
    last_name = " ".join((current_user.full_name or current_user.username or current_user.email or "Employee").split()[1:]) or None
    employee = Employee(
        user_id=current_user.id,
        employee_no=f"EMP-{current_user.id}",
        first_name=first_name,
        last_name=last_name,
        status="Active",
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def _serialize_leave_type(item: LeaveType) -> dict[str, Any]:
    return {
        "id": item.id,
        "code": item.code,
        "name": item.name,
        "description": item.description,
    }


def _serialize_leave_request(item: LeaveRequest) -> dict[str, Any]:
    return {
        "id": item.id,
        "employeeId": item.employee_id,
        "employeeName": " ".join(filter(None, [item.employee.first_name if item.employee else None, item.employee.last_name if item.employee else None])).strip() or None,
        "leaveTypeId": item.leave_type_id,
        "leaveType": item.leave_type.name if item.leave_type else None,
        "startDate": item.start_date.isoformat() if item.start_date else None,
        "endDate": item.end_date.isoformat() if item.end_date else None,
        "days": float(item.days) if item.days is not None else None,
        "reason": item.reason,
        "status": item.status,
        "createdAt": item.created_at.isoformat() if item.created_at else None,
        "updatedAt": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.get("/leave-types/", response_model=APIResponse[PaginationResponse[dict[str, Any]]])
def list_leave_types(db: Session = Depends(get_db)) -> APIResponse[PaginationResponse[dict[str, Any]]]:
    seed_default_leave_types(db)
    items = db.scalars(select(LeaveType).order_by(LeaveType.name)).all()
    response = PaginationResponse(
        items=[_serialize_leave_type(item) for item in items],
        total=len(items),
        page=1,
        page_size=max(len(items), 1),
        pages=1,
    )
    return APIResponse(data=response)


@router.get("/leave-requests/", response_model=APIResponse[PaginationResponse[dict[str, Any]]])
def list_leave_requests(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> APIResponse[PaginationResponse[dict[str, Any]]]:
    employee = _get_or_create_employee_for_user(db, current_user)
    items = (
        db.scalars(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == employee.id)
            .order_by(LeaveRequest.created_at.desc())
        )
        .all()
    )
    response = PaginationResponse(
        items=[_serialize_leave_request(item) for item in items],
        total=len(items),
        page=1,
        page_size=max(len(items), 1),
        pages=1,
    )
    return APIResponse(data=response)


@router.post("/leave-requests/", response_model=APIResponse[dict[str, Any]], status_code=status.HTTP_201_CREATED)
def create_leave_request(
    payload: LeaveRequestPayload,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> APIResponse[dict[str, Any]]:
    employee = _get_or_create_employee_for_user(db, current_user)
    leave_type = db.get(LeaveType, payload.leave_type_id)
    if leave_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave type not found")

    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be on or after start date")

    leave_request = LeaveRequest(
        employee_id=employee.id,
        leave_type_id=leave_type.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        days=Decimal(str(payload.days or 1)),
        reason=payload.reason,
        status=(payload.status or "Pending").capitalize(),
    )
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    return APIResponse(data=_serialize_leave_request(leave_request), message="Leave request submitted")


@router.get("/leave-requests/{leave_request_id}", response_model=APIResponse[dict[str, Any]])
def get_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> APIResponse[dict[str, Any]]:
    employee = _get_or_create_employee_for_user(db, current_user)
    leave_request = db.scalar(select(LeaveRequest).where(LeaveRequest.id == leave_request_id, LeaveRequest.employee_id == employee.id))
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    return APIResponse(data=_serialize_leave_request(leave_request))


@router.delete("/leave-requests/{leave_request_id}", response_model=APIResponse[dict[str, bool]])
def cancel_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
) -> APIResponse[dict[str, bool]]:
    employee = _get_or_create_employee_for_user(db, current_user)
    leave_request = db.scalar(select(LeaveRequest).where(LeaveRequest.id == leave_request_id, LeaveRequest.employee_id == employee.id))
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")
    if leave_request.status.lower() not in {"pending", "draft"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending leave requests can be cancelled")

    leave_request.status = "Cancelled"
    db.commit()
    return APIResponse(data={"success": True}, message="Leave request cancelled")
