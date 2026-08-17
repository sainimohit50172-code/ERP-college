from app.models.finance.payment_mode import PaymentMode
from app.repositories.interfaces.finance import PaymentModeRepository


class PaymentModeService:
    def __init__(self, repository: PaymentModeRepository) -> None:
        self._repository = repository

    async def create(self, **payload) -> PaymentMode:
        entity = PaymentMode(**payload)
        return await self._repository.create(entity)

    async def update(self, entity_id: int, payload):
        return await self._repository.update(entity_id, payload)

    async def delete(self, entity_id: int):
        return await self._repository.delete(entity_id)
