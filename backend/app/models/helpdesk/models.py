from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Ticket(Base):
    __tablename__ = "helpdesk_tickets"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ticket_number: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    lodged_by_type: Mapped[str] = mapped_column(Enum("Student", "Employee", "Visitor", "Other", name="ticket_lodged_by_type"), nullable=False)
    lodged_by_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    requester_email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    requester_phone: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    category: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    priority: Mapped[str] = mapped_column(Enum("Low", "Medium", "High", "Critical", name="ticket_priority"), nullable=False, default="Medium")
    impact: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Enum("Open", "InProgress", "Resolved", "Closed", name="ticket_status"), nullable=False, default="Open")
    assigned_to_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    assigned_to_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    attachments: Mapped[list["TicketAttachment"]] = relationship(back_populates="ticket", lazy="selectin")


class TicketAttachment(Base):
    __tablename__ = "helpdesk_ticket_attachments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    ticket_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("helpdesk_tickets.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(512), nullable=False)
    content_type: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    size: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    uploaded_by_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    uploaded_by_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    ticket: Mapped[Optional[Ticket]] = relationship(back_populates="attachments", lazy="selectin")
