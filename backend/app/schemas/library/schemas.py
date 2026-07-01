from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class LibraryItemBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str = Field(min_length=1, max_length=200)
    author: Optional[str] = Field(default=None, max_length=200)
    category: Optional[str] = Field(default=None, max_length=100)
    available_copies: int = Field(default=0, ge=0)


class LibraryItemCreate(LibraryItemBase):
    pass


class LibraryItemUpdate(LibraryItemBase):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    available_copies: Optional[int] = Field(default=None, ge=0)


class LibraryItemDetail(LibraryItemBase):
    id: int
    created_at: Optional[datetime] = None


class LibraryItemListItem(LibraryItemBase):
    id: int


class LibraryItemResponse(LibraryItemBase):
    id: int


class BookCopyBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    library_item_id: int
    accession_number: str = Field(min_length=1, max_length=100)
    status: str = Field(default="available", max_length=20)


class BookCopyCreate(BookCopyBase):
    pass


class BookCopyUpdate(BookCopyBase):
    library_item_id: Optional[int] = None
    accession_number: Optional[str] = Field(default=None, min_length=1, max_length=100)


class BookCopyDetail(BookCopyBase):
    id: int
    created_at: Optional[datetime] = None


class BookCopyListItem(BookCopyBase):
    id: int


class BookCopyResponse(BookCopyBase):
    id: int


class BookIssueBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    book_copy_id: int
    issue_date: date
    due_date: date
    status: str = Field(default="issued", max_length=20)


class BookIssueCreate(BookIssueBase):
    pass


class BookIssueUpdate(BookIssueBase):
    student_id: Optional[int] = None
    book_copy_id: Optional[int] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None


class BookIssueDetail(BookIssueBase):
    id: int
    created_at: Optional[datetime] = None


class BookIssueListItem(BookIssueBase):
    id: int


class BookIssueResponse(BookIssueBase):
    id: int


class FineBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    amount: Decimal = Field(gt=0)
    reason: str = Field(min_length=1, max_length=200)
    status: str = Field(default="pending", max_length=20)


class FineCreate(FineBase):
    pass


class FineUpdate(FineBase):
    student_id: Optional[int] = None
    amount: Optional[Decimal] = Field(default=None, gt=0)
    reason: Optional[str] = Field(default=None, min_length=1, max_length=200)


class FineDetail(FineBase):
    id: int
    created_at: Optional[datetime] = None


class FineListItem(FineBase):
    id: int


class FineResponse(FineBase):
    id: int


class ReservationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    library_item_id: int
    reserved_on: date
    status: str = Field(default="active", max_length=20)


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(ReservationBase):
    student_id: Optional[int] = None
    library_item_id: Optional[int] = None
    reserved_on: Optional[date] = None


class ReservationDetail(ReservationBase):
    id: int
    created_at: Optional[datetime] = None


class ReservationListItem(ReservationBase):
    id: int


class ReservationResponse(ReservationBase):
    id: int
