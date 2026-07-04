from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, DECIMAL, Enum, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.db.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_no: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    employee_code = synonym("employee_no")
    user_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    designation_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("designations.id"), nullable=True)
    department_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("departments.id"), nullable=True)
    date_of_joining: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Active", "Resigned", "Retired", name="employee_status"), nullable=False, default="Active")
    contact: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped[Optional["User"]] = relationship(back_populates="employees", foreign_keys=[user_id], lazy="selectin")

    @property
    def email(self) -> Optional[str]:
        return (self.contact or {}).get("email")

    @email.setter
    def email(self, value: Optional[str]) -> None:
        contact = dict(self.contact or {})
        if value is None:
            contact.pop("email", None)
        else:
            contact["email"] = str(value)
        self.contact = contact or None

    @property
    def phone(self) -> Optional[str]:
        return (self.contact or {}).get("phone")

    @phone.setter
    def phone(self, value: Optional[str]) -> None:
        contact = dict(self.contact or {})
        if value is None:
            contact.pop("phone", None)
        else:
            contact["phone"] = value
        self.contact = contact or None
    designation: Mapped[Optional["Designation"]] = relationship(back_populates="employees", lazy="selectin")
    department: Mapped[Optional["Department"]] = relationship(back_populates="employees", lazy="selectin")
    leave_requests: Mapped[list["LeaveRequest"]] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
        foreign_keys="LeaveRequest.employee_id",
        lazy="selectin",
    )
    payroll_entries: Mapped[list["PayrollEntry"]] = relationship(back_populates="employee", lazy="selectin")
    drivers: Mapped[list["Driver"]] = relationship(back_populates="employee", lazy="selectin")
    teachers: Mapped[list["Teacher"]] = relationship(back_populates="employee", lazy="selectin")


class LeaveType(Base):
    __tablename__ = "leave_types"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    leave_requests: Mapped[list["LeaveRequest"]] = relationship(back_populates="leave_type", lazy="selectin")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=False)
    leave_type_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("leave_types.id"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    days: Mapped[Decimal] = mapped_column(DECIMAL(5, 2), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Pending", "Approved", "Rejected", "Cancelled", name="leave_status"), nullable=False, default="Pending")
    approver_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee: Mapped[Employee] = relationship(back_populates="leave_requests", foreign_keys=[employee_id], lazy="selectin")
    leave_type: Mapped[LeaveType] = relationship(back_populates="leave_requests", lazy="selectin")
    approver: Mapped[Optional[Employee]] = relationship(foreign_keys=[approver_id], lazy="selectin")


class PayrollRun(Base):
    __tablename__ = "payroll_runs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    generated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(Enum("Draft", "Processed", "Disbursed", name="payroll_run_status"), nullable=False, default="Draft")
    total_amount: Mapped[Decimal] = mapped_column(DECIMAL(18, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    payroll_entries: Mapped[list["PayrollEntry"]] = relationship(back_populates="payroll_run", cascade="all, delete-orphan", lazy="selectin")


class PayrollEntry(Base):
    __tablename__ = "payroll_entries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    payroll_run_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("payroll_runs.id"), nullable=False)
    employee_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=False)
    gross_amount: Mapped[Decimal] = mapped_column(DECIMAL(18, 2), nullable=False)
    net_amount: Mapped[Decimal] = mapped_column(DECIMAL(18, 2), nullable=False)
    deductions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    payroll_run: Mapped[PayrollRun] = relationship(back_populates="payroll_entries", lazy="selectin")
    employee: Mapped[Employee] = relationship(back_populates="payroll_entries", lazy="selectin")
