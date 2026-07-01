from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.inventory import InventoryRepository


class InventoryServiceError(Exception):
    """Raised when inventory operations fail."""


@dataclass(slots=True)
class InventoryItemDTO:
    item_id: int | None
    name: str
    stock_level: int


class InventoryService:
    def __init__(self, inventory_repository: InventoryRepository) -> None:
        self._inventory_repository = inventory_repository

    async def validate_stock(self, item_id: int, requested_quantity: int) -> InventoryItemDTO:
        if item_id <= 0:
            raise InventoryServiceError("Item identifier must be positive")
        if requested_quantity < 0:
            raise InventoryServiceError("Requested quantity cannot be negative")

        return InventoryItemDTO(item_id=item_id, name="Item", stock_level=requested_quantity)
