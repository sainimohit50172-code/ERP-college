from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.finance import FeeCollection
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.fees import FeeRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLFeeRepository(MySQLRepository[FeeCollection], FeeRepository):
    def __init__(self, session):
        super().__init__(session, FeeCollection)

    async def get_pending_fees(self) -> list[FeeCollection]:
        try:
            stmt = select(FeeCollection).where(FeeCollection.status != "Collected")
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def save_payment(self, transaction_id: int, amount: Decimal) -> FeeCollection:
        try:
            fee = await self.get_by_id(transaction_id)
            if fee is None:
                raise RepositoryError("Fee record not found")
            fee.amount = amount
            await self._run_sync(lambda: self.session.commit())
            return fee
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def generate_invoice(self, student_id: int, amount: Decimal) -> FeeCollection:
        fee = FeeCollection(student_id=student_id, category_id=1, amount=amount, status="Pending")
        return await self.create(fee)

    async def record_payment(self, transaction_id: int, amount: Decimal) -> FeeCollection:
        return await self.save_payment(transaction_id, amount)
