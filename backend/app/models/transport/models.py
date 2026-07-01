from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    registration_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    vehicle_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(default=0, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Active", "Inactive", "Maintenance", name="vehicle_status"), nullable=False, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    assignments: Mapped[list["TransportAssignment"]] = relationship(back_populates="vehicle", cascade="all, delete-orphan", lazy="selectin")


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    employee_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=False)
    license_no: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(Enum("Active", "Inactive", name="driver_status"), nullable=False, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    employee: Mapped["Employee"] = relationship(lazy="selectin")


class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    start_point: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    end_point: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    distance_km: Mapped[Optional[int]] = mapped_column(default=0, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    assignments: Mapped[list["TransportAssignment"]] = relationship(back_populates="route", cascade="all, delete-orphan", lazy="selectin")


class RouteStop(Base):
    __tablename__ = "route_stops"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    route_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("routes.id"), nullable=False)
    stop_name: Mapped[str] = mapped_column(String(255), nullable=False)
    sequence_no: Mapped[int] = mapped_column(default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class TransportAssignment(Base):
    __tablename__ = "transport_assignments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("vehicles.id"), nullable=False)
    route_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("routes.id"), nullable=False)
    assigned_to: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=True)
    assigned_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(Enum("Assigned", "Completed", "Cancelled", name="transport_assignment_status"), nullable=False, default="Assigned")

    vehicle: Mapped[Vehicle] = relationship(back_populates="assignments", lazy="selectin")
    route: Mapped[Route] = relationship(back_populates="assignments", lazy="selectin")
    driver: Mapped[Optional["Employee"]] = relationship(lazy="selectin")


class VehicleAssignment(Base):
    __tablename__ = "vehicle_assignments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("vehicles.id"), nullable=False)
    assigned_to: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("employees.id"), nullable=True)
    assigned_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(Enum("Assigned", "Completed", "Cancelled", name="vehicle_assignment_status"), nullable=False, default="Assigned")
