from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from app.repositories.interfaces.finance import FinanceRepository


class FinanceServiceError(Exception):
    """Raised when finance operations fail."""


@dataclass(slots=True)
class LedgerEntryDTO:
    entry_id: int | None
    account_id: int
    amount: Decimal
    direction: str


class FinanceService:
    def __init__(self, finance_repository: FinanceRepository) -> None:
        self._finance_repository = finance_repository

    async def post_entry(self, account_id: int, amount: Decimal, direction: str) -> LedgerEntryDTO:
        if account_id <= 0:
            raise FinanceServiceError("Account identifier must be positive")
        if amount <= 0:
            raise FinanceServiceError("Amount must be positive")

        return LedgerEntryDTO(entry_id=None, account_id=account_id, amount=amount, direction=direction)
