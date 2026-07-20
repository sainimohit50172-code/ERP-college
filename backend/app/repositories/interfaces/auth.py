from __future__ import annotations

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Optional

from app.models.auth import AuthSession, MobileOTP, PasswordReset, User
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
    async def create_user(self, payload: dict) -> User:
        raise NotImplementedError

    @abstractmethod
    async def assign_role(self, user_id: int, role_name: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def update_login_state(self, user_id: int, failed_attempts: int, locked_until: Optional[datetime]) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def get_login_state(self, user_id: int) -> dict:
        raise NotImplementedError

    @abstractmethod
    async def change_password(self, user_id: int, new_password: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def create_refresh_session(
        self,
        user_id: int,
        refresh_token_hash: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuthSession:
        raise NotImplementedError

    @abstractmethod
    async def get_refresh_session(self, refresh_token_hash: str) -> Optional[AuthSession]:
        raise NotImplementedError

    @abstractmethod
    async def rotate_refresh_token(
        self,
        old_refresh_token_hash: str,
        new_refresh_token_hash: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[AuthSession]:
        raise NotImplementedError

    @abstractmethod
    async def revoke_refresh_token(self, refresh_token_hash: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def revoke_user_refresh_sessions(self, user_id: int) -> int:
        raise NotImplementedError

    @abstractmethod
    async def create_mobile_otp(
        self,
        mobile_number: str,
        otp_code: str,
        expires_at: datetime,
        meta: Optional[dict] = None,
    ) -> MobileOTP:
        raise NotImplementedError

    @abstractmethod
    async def get_latest_mobile_otp(self, mobile_number: str) -> Optional[MobileOTP]:
        raise NotImplementedError

    @abstractmethod
    async def mark_mobile_otp_verified(self, otp_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def mark_mobile_otp_used(self, otp_id: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def create_password_reset(
        self,
        user_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> PasswordReset:
        raise NotImplementedError

    @abstractmethod
    async def get_password_reset(self, token_hash: str) -> Optional[PasswordReset]:
        raise NotImplementedError

    @abstractmethod
    async def mark_password_reset_used(self, reset_id: str) -> bool:
        raise NotImplementedError
