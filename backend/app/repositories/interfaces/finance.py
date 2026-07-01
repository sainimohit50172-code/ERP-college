from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal

from app.models.finance import LedgerEntry, Transaction
from app.repositories.interfaces.base import BaseRepository


class FinanceRepository(BaseRepository[Transaction], ABC):
    @abstractmethod
    async def post_journal(self, entry: LedgerEntry) -> LedgerEntry:
        raise NotImplementedError

    @abstractmethod
    async def get_ledger(self, account_id: int) -> list[LedgerEntry]:
        raise NotImplementedError
