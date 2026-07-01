from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import BigInteger, DateTime, DECIMAL, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class FeeCategory(Base):
    __tablename__ = "fee_categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    structures: Mapped[list["FeeStructure"]] = relationship(back_populates="category", cascade="all, delete-orphan", lazy="selectin")
    collections: Mapped[list["FeeCollection"]] = relationship(back_populates="category", lazy="selectin")


class FeeStructure(Base):
    __tablename__ = "fee_structures"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("fee_categories.id"), nullable=False)
    academic_year_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("academic_years.id"), nullable=True)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    category: Mapped[FeeCategory] = relationship(back_populates="structures", lazy="selectin")
    academic_year: Mapped[Optional["AcademicYear"]] = relationship(lazy="selectin")


class FeeCollection(Base):
    __tablename__ = "fee_collections"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("fee_categories.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    collected_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    payment_mode: Mapped[Optional[str]] = mapped_column(Enum("Cash", "Card", "UPI", "BankTransfer", name="payment_mode"), nullable=True)
    receipt_no: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, unique=True)
    status: Mapped[str] = mapped_column(Enum("Pending", "Collected", "Refunded", name="fee_collection_status"), nullable=False, default="Collected")

    student: Mapped["Student"] = relationship(back_populates="fee_collections", lazy="selectin")
    category: Mapped[FeeCategory] = relationship(back_populates="collections", lazy="selectin")


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    account_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    account_name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    balance: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    transactions: Mapped[list["Transaction"]] = relationship(back_populates="account", cascade="all, delete-orphan", lazy="selectin")


class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("academic_years.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    academic_year: Mapped["AcademicYear"] = relationship(lazy="selectin")


class ChartAccount(Base):
    __tablename__ = "chart_accounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    account_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("chart_accounts.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    parent: Mapped[Optional["ChartAccount"]] = relationship(remote_side=[id], lazy="selectin")


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    entry_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    entry_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    lines: Mapped[list["JournalLine"]] = relationship(back_populates="entry", cascade="all, delete-orphan", lazy="selectin")


class JournalLine(Base):
    __tablename__ = "journal_lines"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    journal_entry_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("journal_entries.id"), nullable=False)
    account_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    debit: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    credit: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    entry: Mapped[JournalEntry] = relationship(back_populates="lines", lazy="selectin")
    account: Mapped[Account] = relationship(lazy="selectin")


class LedgerAccount(Base):
    __tablename__ = "ledger_accounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    balance: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    receipt_no: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    received_on: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(Enum("Pending", "Completed", name="receipt_status"), nullable=False, default="Completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(lazy="selectin")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)
    direction: Mapped[str] = mapped_column(Enum("Credit", "Debit", name="transaction_direction"), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    account: Mapped[Account] = relationship(back_populates="transactions", lazy="selectin")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("students.id"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    status: Mapped[str] = mapped_column(Enum("Pending", "Success", "Failed", name="payment_status"), nullable=False, default="Pending")
    gateway_reference: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    paid_on: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="payments", lazy="selectin")


class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    account_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("accounts.id"), nullable=False)
    entry_type: Mapped[str] = mapped_column(Enum("Debit", "Credit", name="ledger_entry_type"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(12, 2), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    account: Mapped[Account] = relationship(lazy="selectin")
