from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.inventory import InventoryItem, StockMovement
from app.repositories.interfaces.base import BaseRepository


class InventoryRepository(BaseRepository[InventoryItem], ABC):
    @abstractmethod
    async def adjust_stock(self, item_id: int, quantity: int) -> StockMovement:
        raise NotImplementedError

    @abstractmethod
    async def get_stock_levels(self) -> list[InventoryItem]:
        raise NotImplementedError
