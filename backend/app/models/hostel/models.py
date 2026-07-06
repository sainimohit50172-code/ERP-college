from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Hostel(Base):
    __tablename__ = "hostels"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(default=0, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    rooms: Mapped[list["Room"]] = relationship(back_populates="hostel", cascade="all, delete-orphan", lazy="selectin")


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    hostel_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("hostels.id"), nullable=False)
    room_no: Mapped[str] = mapped_column(String(64), nullable=False)
    capacity: Mapped[Optional[int]] = mapped_column(default=1, nullable=True)
    # classroom metadata fields added to persist UI fields
    building: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    floor: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    has_projector: Mapped[bool] = mapped_column(default=False, nullable=False)
    has_lab: Mapped[bool] = mapped_column(default=False, nullable=False)
    has_ac: Mapped[bool] = mapped_column(default=False, nullable=False)
    status: Mapped[str] = mapped_column(Enum("Active", "Maintenance", "Inactive", name="room_status"), nullable=False, default="Active")
    gender: Mapped[Optional[str]] = mapped_column(Enum("M", "F", "Coed", name="room_gender"), nullable=True, default="Coed")

    hostel: Mapped[Hostel] = relationship(back_populates="rooms", lazy="selectin")
    beds: Mapped[list["Bed"]] = relationship(back_populates="room", cascade="all, delete-orphan", lazy="selectin")


class Bed(Base):
    __tablename__ = "beds"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("rooms.id"), nullable=False)
    bed_no: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    occupied: Mapped[bool] = mapped_column(default=False, nullable=False)

    room: Mapped[Room] = relationship(back_populates="beds", lazy="selectin")
    hostel_allocations: Mapped[list["HostelAllocation"]] = relationship(back_populates="bed", lazy="selectin")


class HostelAllocation(Base):
    __tablename__ = "hostel_allocations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    bed_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("beds.id"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Active", "Completed", "Cancelled", name="hostel_allocation_status"), nullable=False, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="hostel_allocations", lazy="selectin")
    bed: Mapped[Bed] = relationship(back_populates="hostel_allocations", lazy="selectin")


class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    lodged_by_type: Mapped[str] = mapped_column(Enum("Student", "Employee", "Visitor", name="complaint_lodged_by_type"), nullable=False)
    lodged_by_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    category: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(Enum("Open", "InProgress", "Resolved", "Closed", name="complaint_status"), nullable=True, default="Open")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    visited_for: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    in_time: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    out_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
