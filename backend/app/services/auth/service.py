from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.repositories.interfaces.auth import AuthRepository

settings = get_settings()


class AuthServiceError(Exception):
    """Raised when authentication or account operations fail."""


@dataclass(slots=True)
class AuthUserDTO:
    id: int
    email: str
    username: Optional[str] = None


class AuthService:
    def __init__(self, auth_repository: AuthRepository) -> None:
        self._auth_repository = auth_repository

    async def authenticate_user(self, email: str, password: str) -> AuthUserDTO:
        user = await self._auth_repository.authenticate(email, password)
        if user is None:
            raise AuthServiceError("Invalid credentials")

        return AuthUserDTO(
            id=user.id,
            email=user.email,
            username=getattr(user, "username", None),
        )

    async def login_user(
        self,
        email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> dict[str, str | int]:
        user = await self._auth_repository.authenticate(email, password)
        if user is None:
            raise AuthServiceError("Invalid credentials")

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token()
        refresh_token_hash = hash_token(refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        await self._auth_repository.create_refresh_session(
            user_id=user.id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
        }

    async def refresh_tokens(
        self,
        refresh_token: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> dict[str, str | int]:
        refresh_token_hash = hash_token(refresh_token)
        session = await self._auth_repository.get_refresh_session(refresh_token_hash)
        if session is None or session.revoked:
            raise AuthServiceError("Invalid refresh token")
        if session.expires_at is not None and session.expires_at < datetime.now(timezone.utc):
            raise AuthServiceError("Refresh token expired")

        user = await self._auth_repository.get_by_id(session.user_id)
        if user is None:
            raise AuthServiceError("Invalid user for refresh token")

        new_refresh_token = create_refresh_token()
        new_refresh_token_hash = hash_token(new_refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        await self._auth_repository.rotate_refresh_token(
            old_refresh_token_hash=refresh_token_hash,
            new_refresh_token_hash=new_refresh_token_hash,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        access_token = create_access_token(subject=str(user.id))
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
        }

    async def logout(
        self,
        refresh_token: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> bool:
        if refresh_token:
            token_hash = hash_token(refresh_token)
            revoked = await self._auth_repository.revoke_refresh_token(token_hash)
            if not revoked:
                raise AuthServiceError("Refresh token not found or already revoked")
            return True

        if user_id is not None:
            await self._auth_repository.revoke_user_refresh_sessions(user_id)
            return True

        raise AuthServiceError("No refresh token or authenticated user provided")

    async def get_user_from_token(self, token: str):
        try:
            payload = decode_access_token(token)
        except Exception as exc:
            raise AuthServiceError("Invalid or expired access token") from exc

        subject = payload.get("sub")
        if subject is None:
            raise AuthServiceError("Invalid access token payload")

        try:
            user_id = int(subject)
        except ValueError as exc:
            raise AuthServiceError("Invalid token subject") from exc

        user = await self._auth_repository.get_by_id(user_id)
        if user is None:
            raise AuthServiceError("User not found")
        return user

    async def change_password(self, user_id: int, current_password: str, new_password: str) -> bool:
        user = await self._auth_repository.get_by_id(user_id)
        if user is None or user.hashed_password is None:
            raise AuthServiceError("User not found or password unset")
        if not verify_password(current_password, user.hashed_password):
            raise AuthServiceError("Current password is invalid")
        if not new_password or len(new_password) < 8:
            raise AuthServiceError("Password must be at least 8 characters")

        hashed_password = get_password_hash(new_password)
        return await self._auth_repository.change_password(user_id, hashed_password)

    async def request_password_reset(self, email: str) -> str:
        user = await self._auth_repository.get_by_email(email)
        if user is None:
            return ""

        reset_token = create_refresh_token()
        token_hash = hash_token(reset_token)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        await self._auth_repository.create_password_reset(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        return reset_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        if not new_password or len(new_password) < 8:
            raise AuthServiceError("Password must be at least 8 characters")

        token_hash = hash_token(token)
        reset_record = await self._auth_repository.get_password_reset(token_hash)
        if reset_record is None or reset_record.used:
            raise AuthServiceError("Invalid or already used reset token")
        if reset_record.expires_at < datetime.now(timezone.utc):
            raise AuthServiceError("Reset token expired")

        user = await self._auth_repository.get_by_id(reset_record.user_id)
        if user is None:
            raise AuthServiceError("User not found for reset token")

        hashed_password = get_password_hash(new_password)
        success = await self._auth_repository.change_password(user.id, hashed_password)
        if not success:
            raise AuthServiceError("Failed to reset password")

        await self._auth_repository.mark_password_reset_used(reset_record.id)
        await self._auth_repository.revoke_user_refresh_sessions(user.id)
        return True
