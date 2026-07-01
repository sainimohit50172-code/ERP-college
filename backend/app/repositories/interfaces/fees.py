from __future__ import annotations

from abc import ABC, abstractmethod
from decimal import Decimal

from app.models.finance import FeeCollection
from app.repositories.interfaces.base import BaseRepository


class FeeRepository(BaseRepository[FeeCollection], ABC):
    @abstractmethod
    async def generate_invoice(self, student_id: int, amount: Decimal) -> FeeTransaction:
        raise NotImplementedError

    @abstractmethod
    async def record_payment(self, transaction_id: int, amount: Decimal) -> FeeTransaction:
        raise NotImplementedError
