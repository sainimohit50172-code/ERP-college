from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.inventory import InventoryItem, StockMovement
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.inventory import InventoryRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLInventoryRepository(MySQLRepository[InventoryItem], InventoryRepository):
    def __init__(self, session):
        super().__init__(session, InventoryItem)

    async def available_stock(self) -> list[InventoryItem]:
        try:
            stmt = select(InventoryItem).where(InventoryItem.quantity > 0)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def adjust_stock_record(self, item_id: int, quantity: int) -> StockMovement:
        movement = StockMovement(item_id=item_id, quantity=quantity)
        self.session.add(movement)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(movement))
        return movement

    async def adjust_stock(self, item_id: int, quantity: int) -> StockMovement:
        return await self.adjust_stock_record(item_id, quantity)

    async def get_stock_levels(self) -> list[InventoryItem]:
        return await self.available_stock()
