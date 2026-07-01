from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from app.models.auth import User
from app.repositories.interfaces.base import BaseRepository


class AuthRepository(BaseRepository[User], ABC):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    async def get_by_username(self, username: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    async def change_password(self, user_id: int, new_password: str) -> bool:
        raise NotImplementedError
