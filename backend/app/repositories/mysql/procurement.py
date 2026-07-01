from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.procurement import PurchaseOrder, PurchaseRequest
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.procurement import ProcurementRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLProcurementRepository(MySQLRepository[PurchaseOrder], ProcurementRepository):
    def __init__(self, session):
        super().__init__(session, PurchaseOrder)

    async def purchase_requests(self) -> list[PurchaseRequest]:
        try:
            stmt = select(PurchaseRequest)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def purchase_orders(self) -> list[PurchaseOrder]:
        try:
            stmt = select(PurchaseOrder)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def approve_purchase(self, purchase_request_id: int) -> PurchaseRequest:
        request = PurchaseRequest(id=purchase_request_id)
        self.session.add(request)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(request))
        return request

    async def create_po(self, purchase_request_id: int) -> PurchaseOrder:
        order = PurchaseOrder(id=purchase_request_id)
        self.session.add(order)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(order))
        return order

    async def receive_goods(self, purchase_order_id: int) -> PurchaseOrder:
        order = await self.get_by_id(purchase_order_id)
        if order is None:
            raise RepositoryError("Purchase order not found")
        return order
