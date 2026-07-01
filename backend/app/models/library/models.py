from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, Date, DateTime, DECIMAL, Enum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class LibraryItem(Base):
    __tablename__ = "library_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    isbn: Mapped[Optional[str]] = mapped_column(String(32), unique=True, nullable=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    publisher: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    total_copies: Mapped[int] = mapped_column(default=1, nullable=False)
    available_copies: Mapped[int] = mapped_column(default=1, nullable=False)
    extra_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    copies: Mapped[list["BookCopy"]] = relationship(back_populates="item", cascade="all, delete-orphan", lazy="selectin")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="item", lazy="selectin")


class BookCopy(Base):
    __tablename__ = "book_copies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("library_items.id"), nullable=False)
    copy_no: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    barcode: Mapped[Optional[str]] = mapped_column(String(128), unique=True, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Available", "OnLoan", "Reserved", "Lost", "Maintenance", name="book_copy_status"), nullable=False, default="Available")
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    item: Mapped[LibraryItem] = relationship(back_populates="copies", lazy="selectin")
    issues: Mapped[list["BookIssue"]] = relationship(back_populates="copy", lazy="selectin")


class BookIssue(Base):
    __tablename__ = "book_issues"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    copy_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("book_copies.id"), nullable=False)
    borrower_type: Mapped[str] = mapped_column(Enum("Student", "Employee", name="borrower_type"), nullable=False)
    borrower_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    issued_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    due_on: Mapped[date] = mapped_column(Date, nullable=False)
    returned_on: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    fine_amount: Mapped[Optional[Decimal]] = mapped_column(DECIMAL(10, 2), nullable=True, default=0)
    status: Mapped[str] = mapped_column(Enum("Issued", "Returned", "Overdue", "Lost", name="book_issue_status"), nullable=False, default="Issued")
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)

    copy: Mapped[BookCopy] = relationship(back_populates="issues", lazy="selectin")


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("library_items.id"), nullable=False)
    borrower_type: Mapped[str] = mapped_column(Enum("Student", "Employee", name="reservation_borrower_type"), nullable=False)
    borrower_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    reserved_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Active", "Fulfilled", "Cancelled", "Expired", name="reservation_status"), nullable=False, default="Active")

    item: Mapped[LibraryItem] = relationship(back_populates="reservations", lazy="selectin")


class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    borrower_type: Mapped[str] = mapped_column(Enum("Student", "Employee", name="fine_borrower_type"), nullable=False)
    borrower_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    paid: Mapped[bool] = mapped_column(default=False, nullable=False)
    paid_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
