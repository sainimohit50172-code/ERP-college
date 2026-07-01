from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.finance import LedgerEntry, Transaction
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.finance import FinanceRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLFinanceRepository(MySQLRepository[Transaction], FinanceRepository):
    def __init__(self, session):
        super().__init__(session, Transaction)

    async def ledger_entries(self, account_id: int) -> list[LedgerEntry]:
        try:
            stmt = select(LedgerEntry).where(LedgerEntry.account_id == account_id)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def journal_entries(self) -> list[LedgerEntry]:
        try:
            stmt = select(LedgerEntry)
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def post_journal(self, entry: LedgerEntry) -> LedgerEntry:
        try:
            self.session.add(entry)
            await self._run_sync(lambda: self.session.commit())
            await self._run_sync(lambda: self.session.refresh(entry))
            return entry
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def get_ledger(self, account_id: int) -> list[LedgerEntry]:
        return await self.ledger_entries(account_id)
