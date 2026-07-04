from __future__ import annotations

import inspect
from typing import Any, Generic, List, Optional, TypeVar

from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import noload

from app.models import Base
from app.repositories.interfaces.base import BaseRepository, RepositoryError

T = TypeVar("T", bound=Base)


class MySQLRepository(BaseRepository[T], Generic[T]):
    def __init__(self, session: Any, model_type: type[T]):
        self.session = session
        self.model_type = model_type

    async def get_by_id(self, entity_id: int) -> Optional[T]:
        try:
            result = await self._get(entity_id)
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_all(self) -> List[T]:
        try:
            stmt = select(self.model_type).options(noload("*"))
            result = await self._execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def search(self, query: str) -> List[T]:
        try:
            stmt = select(self.model_type).where(self.model_type.__table__.c.id.like(f"%{query}%")).options(noload("*"))
            result = await self._execute(stmt)
            return list(result.scalars().all())
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def paginate(self, page: int, page_size: int) -> tuple[List[T], int]:
        try:
            total_result = await self._execute(select(func.count(self.model_type.id)))
            total = int(total_result.scalar_one() or 0)
            stmt = select(self.model_type).options(noload("*")).offset((page - 1) * page_size).limit(page_size)
            items_result = await self._execute(stmt)
            return list(items_result.scalars().all()), total
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def exists(self, entity_id: int) -> bool:
        try:
            entity = await self.get_by_id(entity_id)
            return entity is not None
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def count(self) -> int:
        try:
            result = await self._execute(select(func.count(self.model_type.id)))
            return int(result.scalar_one() or 0)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def create(self, entity: T) -> T:
        try:
            await self._add(entity)
            await self._commit()
            await self._refresh(entity)
            return entity
        except IntegrityError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def update(self, entity_id: int, entity: T) -> Optional[T]:
        try:
            existing = await self.get_by_id(entity_id)
            if existing is None:
                return None
            for key, value in entity.__dict__.items():
                if key.startswith("_"):
                    continue
                setattr(existing, key, value)
            await self._commit()
            await self._refresh(existing)
            return existing
        except IntegrityError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def delete(self, entity_id: int) -> bool:
        try:
            entity = await self.get_by_id(entity_id)
            if entity is None:
                return False
            await self._delete(entity)
            await self._commit()
            return True
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def bulk_create(self, entities: List[T]) -> List[T]:
        try:
            await self._add_all(entities)
            await self._commit()
            for entity in entities:
                await self._refresh(entity)
            return entities
        except IntegrityError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def bulk_update(self, entities: List[T]) -> List[T]:
        try:
            for entity in entities:
                await self._add(entity)
            await self._commit()
            return entities
        except IntegrityError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def bulk_delete(self, entity_ids: List[int]) -> int:
        try:
            await self._execute(delete(self.model_type).where(self.model_type.id.in_(entity_ids)))
            await self._commit()
            return len(entity_ids)
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc

    async def _get(self, entity_id: int) -> Optional[T]:
        if hasattr(self.session, "get"):
            # prefer to avoid loading relationships when fetching a single
            # entity to keep integration tests resilient against missing
            # related tables in partial DB states.
            try:
                result = self.session.get(self.model_type, entity_id, options=[noload("*")])
            except TypeError:
                # some session implementations may not accept options param
                result = self.session.get(self.model_type, entity_id)
            if inspect.isawaitable(result):
                result = await result
            return result
        raise RepositoryError("Session does not support get")

    async def _execute(self, stmt: Any) -> Any:
        if hasattr(self.session, "execute"):
            result = self.session.execute(stmt)
            if inspect.isawaitable(result):
                result = await result
            return result
        raise RepositoryError("Session does not support execute")

    async def _add(self, entity: T) -> None:
        if hasattr(self.session, "add"):
            result = self.session.add(entity)
            if inspect.isawaitable(result):
                await result
            return
        raise RepositoryError("Session does not support add")

    async def _add_all(self, entities: List[T]) -> None:
        if hasattr(self.session, "add_all"):
            result = self.session.add_all(entities)
            if inspect.isawaitable(result):
                await result
            return
        raise RepositoryError("Session does not support add_all")

    async def _delete(self, entity: T) -> None:
        if hasattr(self.session, "delete"):
            result = self.session.delete(entity)
            if inspect.isawaitable(result):
                await result
            return
        raise RepositoryError("Session does not support delete")

    async def _commit(self) -> None:
        if hasattr(self.session, "commit"):
            result = self.session.commit()
            if inspect.isawaitable(result):
                await result
            return
        raise RepositoryError("Session does not support commit")

    async def _rollback(self) -> None:
        if hasattr(self.session, "rollback"):
            result = self.session.rollback()
            if inspect.isawaitable(result):
                await result
            return

    async def _refresh(self, entity: T) -> None:
        if hasattr(self.session, "refresh"):
            try:
                # Refresh only mapped column attributes to avoid triggering
                # lazy loading of relationship collections (which may reference
                # missing tables in some test DB states).
                from sqlalchemy.orm import class_mapper

                cols = [c.key for c in class_mapper(entity.__class__).columns]
                result = self.session.refresh(entity, attribute_names=cols)
                if inspect.isawaitable(result):
                    await result
            except Exception:
                # Fallback to generic refresh if any inspector fails.
                result = self.session.refresh(entity)
                if inspect.isawaitable(result):
                    await result
            return
        
    async def _run_sync(self, fn: Callable[[], Any]) -> Any:
        """Run a synchronous callable and await its result if needed.

        Many repository helpers use `_run_sync` to execute session-bound
        callables that may be sync. This helper calls the function and
        awaits the result if it's awaitable, converting sync usages into
        an async-friendly pattern.
        """
        try:
            result = fn()
            if inspect.isawaitable(result):
                result = await result
            return result
        except Exception as exc:
            raise RepositoryError(str(exc)) from exc
