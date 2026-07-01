from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.auth import AuthRepository


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

    async def change_password(self, user_id: int, new_password: str) -> bool:
        if not new_password or len(new_password) < 6:
            raise AuthServiceError("Password must be at least 6 characters")
        return await self._auth_repository.change_password(user_id, new_password)
