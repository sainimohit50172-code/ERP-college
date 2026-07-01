from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.procurement import PurchaseOrder, PurchaseRequest
from app.repositories.interfaces.base import BaseRepository


class ProcurementRepository(BaseRepository[PurchaseOrder], ABC):
    @abstractmethod
    async def approve_purchase(self, purchase_request_id: int) -> PurchaseRequest:
        raise NotImplementedError

    @abstractmethod
    async def create_po(self, purchase_request_id: int) -> PurchaseOrder:
        raise NotImplementedError

    @abstractmethod
    async def receive_goods(self, purchase_order_id: int) -> PurchaseOrder:
        raise NotImplementedError
