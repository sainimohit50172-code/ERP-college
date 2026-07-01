from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.auth import User
from app.repositories.interfaces.auth import AuthRepository
from app.repositories.mysql.base import MySQLRepository
from app.repositories.interfaces.base import RepositoryError


class MySQLAuthRepository(MySQLRepository[User], AuthRepository):
    def __init__(self, session):
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.email == email)
            result = await self._run_sync(lambda: self.session.scalars(stmt).first())
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_by_username(self, username: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.username == username)
            result = await self._run_sync(lambda: self.session.scalars(stmt).first())
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.email == email)
            result = await self._run_sync(lambda: self.session.scalars(stmt).first())
            if result is None:
                return None
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def change_password(self, user_id: int, new_password: str) -> bool:
        try:
            user = await self.get_by_id(user_id)
            if user is None:
                return False
            user.hashed_password = new_password
            await self._run_sync(lambda: self.session.commit())
            return True
        except SQLAlchemyError as exc:
            await self._rollback()
            raise RepositoryError(str(exc)) from exc
