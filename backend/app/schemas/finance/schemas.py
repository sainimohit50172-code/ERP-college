from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AccountBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(min_length=1, max_length=200)
    account_type: str = Field(min_length=1, max_length=50)
    balance: Decimal = Field(default=0, ge=0)
    status: str = Field(default="active", max_length=20)


class AccountCreate(AccountBase):
    pass


class AccountUpdate(AccountBase):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    balance: Optional[Decimal] = Field(default=None, ge=0)


class AccountDetail(AccountBase):
    id: int
    created_at: Optional[datetime] = None


class AccountListItem(AccountBase):
    id: int


class AccountResponse(AccountBase):
    id: int


class FeeStructureBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    program: str = Field(min_length=1, max_length=100)
    term: str = Field(min_length=1, max_length=50)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="INR", max_length=10)


class FeeStructureCreate(FeeStructureBase):
    pass


class FeeStructureUpdate(FeeStructureBase):
    program: Optional[str] = Field(default=None, min_length=1, max_length=100)
    term: Optional[str] = Field(default=None, min_length=1, max_length=50)
    amount: Optional[Decimal] = Field(default=None, gt=0)


class FeeStructureDetail(FeeStructureBase):
    id: int
    created_at: Optional[datetime] = None


class FeeStructureListItem(FeeStructureBase):
    id: int


class FeeStructureResponse(FeeStructureBase):
    id: int


class PaymentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    student_id: int
    amount: Decimal = Field(gt=0)
    payment_method: str = Field(min_length=1, max_length=50)
    payment_date: date
    status: str = Field(default="paid", max_length=20)


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(PaymentBase):
    student_id: Optional[int] = None
    amount: Optional[Decimal] = Field(default=None, gt=0)
    payment_date: Optional[date] = None


class PaymentDetail(PaymentBase):
    id: int
    created_at: Optional[datetime] = None


class PaymentListItem(PaymentBase):
    id: int


class PaymentResponse(PaymentBase):
    id: int


class TransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    account_id: int
    transaction_type: str = Field(min_length=1, max_length=50)
    amount: Decimal = Field(gt=0)
    transaction_date: date
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(TransactionBase):
    account_id: Optional[int] = None
    transaction_type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    amount: Optional[Decimal] = Field(default=None, gt=0)
    transaction_date: Optional[date] = None


class TransactionDetail(TransactionBase):
    id: int
    created_at: Optional[datetime] = None


class TransactionListItem(TransactionBase):
    id: int


class TransactionResponse(TransactionBase):
    id: int
