from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Generic, List, Optional, Protocol, TypeVar

from app.models import Base

T = TypeVar("T", bound=Base)


class RepositoryError(Exception):
    """Base exception for repository contract violations."""


class SupportsCRUD(Protocol[T]):
    async def get_by_id(self, entity_id: int) -> Optional[T]:
        ...

    async def get_all(self) -> List[T]:
        ...

    async def search(self, query: str) -> List[T]:
        ...

    async def create(self, entity: T) -> T:
        ...

    async def update(self, entity_id: int, entity: T) -> Optional[T]:
        ...

    async def delete(self, entity_id: int) -> bool:
        ...

    async def exists(self, entity_id: int) -> bool:
        ...

    async def count(self) -> int:
        ...

    async def paginate(self, page: int, page_size: int) -> tuple[List[T], int]:
        ...

    async def bulk_create(self, entities: List[T]) -> List[T]:
        ...

    async def bulk_update(self, entities: List[T]) -> List[T]:
        ...

    async def bulk_delete(self, entity_ids: List[int]) -> int:
        ...


class BaseRepository(ABC, Generic[T]):
    @abstractmethod
    async def get_by_id(self, entity_id: int) -> Optional[T]:
        raise NotImplementedError

    @abstractmethod
    async def get_all(self) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    async def search(self, query: str) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    async def create(self, entity: T) -> T:
        raise NotImplementedError

    @abstractmethod
    async def update(self, entity_id: int, entity: T) -> Optional[T]:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, entity_id: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def exists(self, entity_id: int) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def count(self) -> int:
        raise NotImplementedError

    @abstractmethod
    async def paginate(self, page: int, page_size: int) -> tuple[List[T], int]:
        raise NotImplementedError

    @abstractmethod
    async def bulk_create(self, entities: List[T]) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    async def bulk_update(self, entities: List[T]) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    async def bulk_delete(self, entity_ids: List[int]) -> int:
        raise NotImplementedError
