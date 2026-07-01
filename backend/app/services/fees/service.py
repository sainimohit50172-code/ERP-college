from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

from app.repositories.interfaces.fees import FeeRepository


class FeeServiceError(Exception):
    """Raised when fee workflow operations fail."""


@dataclass(slots=True)
class FeeInvoiceDTO:
    student_id: int
    amount: Decimal
    status: str = "Pending"


class FeeService:
    def __init__(self, fee_repository: FeeRepository) -> None:
        self._fee_repository = fee_repository

    async def create_invoice(self, student_id: int, amount: Decimal) -> FeeInvoiceDTO:
        if amount <= 0:
            raise FeeServiceError("Invoice amount must be positive")

        return FeeInvoiceDTO(student_id=student_id, amount=amount)
