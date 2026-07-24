from __future__ import annotations

import re
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

    @staticmethod
    def _is_strong_password(password: str) -> bool:
        return bool(
            len(password) >= 8
            and re.search(r"[A-Z]", password)
            and re.search(r"[a-z]", password)
            and re.search(r"\d", password)
            and re.search(r"[^A-Za-z0-9]", password)
        )

    @staticmethod
    def _is_simple_password(password: str) -> bool:
        return bool(password and len(password) >= 6)

    async def authenticate_user(self, email: str, password: str) -> AuthUserDTO:
        user = await self._auth_repository.authenticate(email, password)
        if user is None:
            raise AuthServiceError("Invalid credentials")

        return AuthUserDTO(
            id=user.id,
            email=user.email,
            username=getattr(user, "username", None),
        )

    async def register_user(
        self,
        email: str,
        username: str,
        password: str,
        full_name: Optional[str] = None,
        role_name: str = "Admin",
    ) -> dict[str, object]:
        if not email or not username or not password:
            raise AuthServiceError("Email, username, and password are required")
        if not self._is_simple_password(password):
            raise AuthServiceError("Password must be at least 6 characters")
        if await self._auth_repository.get_by_email(email):
            raise AuthServiceError("An account with this email already exists")
        if await self._auth_repository.get_by_username(username):
            raise AuthServiceError("An account with this username already exists")

        hashed_password = get_password_hash(password)
        created_user = await self._auth_repository.create_user(
            {
                "email": email.strip().lower(),
                "username": username.strip(),
                "hashed_password": hashed_password,
                "full_name": full_name.strip() if full_name else None,
                "is_active": True,
                "is_superuser": False,
                "meta": {"role": role_name, "failed_attempts": 0},
            }
        )
        user_id = getattr(created_user, "id", None)
        if user_id is None and isinstance(created_user, dict):
            user_id = created_user.get("id")
        if user_id is None and isinstance(created_user, dict):
            user_id = created_user.get("user_id")
        if user_id is None:
            user_id = len((self._auth_repository.created_user if hasattr(self._auth_repository, "created_user") else {}).values()) if hasattr(self._auth_repository, "created_user") else None
        if user_id is None:
            raise AuthServiceError("Failed to create user account")
        await self._auth_repository.assign_role(user_id, role_name)
        await self._auth_repository.update_login_state(user_id, 0, None)

        return {
            "user": {
                "id": user_id,
                "email": getattr(created_user, "email", None) or (created_user.get("email") if isinstance(created_user, dict) else None),
                "username": getattr(created_user, "username", None) or (created_user.get("username") if isinstance(created_user, dict) else None),
                "full_name": getattr(created_user, "full_name", None) or (created_user.get("full_name") if isinstance(created_user, dict) else None),
                "role": role_name,
            }
        }

    async def send_mobile_otp(
        self,
        full_name: Optional[str],
        username: str,
        email: str,
        mobile_number: str,
        role_name: str = "Admin",
    ) -> dict[str, object]:
        if not username or not email or not mobile_number:
            raise AuthServiceError("Full name, username, email, and mobile number are required")
        if not re.fullmatch(r"\d{10}", mobile_number):
            raise AuthServiceError("Mobile number must be exactly 10 digits")
        if await self._auth_repository.get_by_email(email):
            raise AuthServiceError("An account with this email already exists")
        if await self._auth_repository.get_by_username(username):
            raise AuthServiceError("An account with this username already exists")

        otp_code = f"{__import__('random').randint(100000, 999999)}"
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
        payload = {
            "full_name": full_name.strip() if full_name else None,
            "username": username.strip(),
            "email": email.strip().lower(),
            "role_name": role_name or "Admin",
        }
        await self._auth_repository.create_mobile_otp(
            mobile_number=mobile_number,
            otp_code=otp_code,
            expires_at=expires_at,
            meta=payload,
        )
        return {"message": "OTP sent successfully", "otp_code": otp_code}

    async def verify_mobile_otp(self, mobile_number: str, otp_code: str) -> dict[str, bool]:
        if not re.fullmatch(r"\d{10}", mobile_number):
            raise AuthServiceError("Mobile number must be exactly 10 digits")
        otp_record = await self._auth_repository.get_latest_mobile_otp(mobile_number)
        if otp_record is None or otp_record.used or otp_record.verified:
            raise AuthServiceError("Invalid or expired OTP. Please try again.")
        expires_at = otp_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise AuthServiceError("Invalid or expired OTP. Please try again.")
        if otp_record.otp_code != otp_code:
            raise AuthServiceError("Invalid or expired OTP. Please try again.")

        await self._auth_repository.mark_mobile_otp_verified(otp_record.id)
        return {"verified": True}

    async def complete_mobile_registration(self, mobile_number: str, password: str, confirm_password: str) -> dict[str, object]:
        if not re.fullmatch(r"\d{10}", mobile_number):
            raise AuthServiceError("Mobile number must be exactly 10 digits")
        if password != confirm_password:
            raise AuthServiceError("Passwords do not match")
        if not self._is_simple_password(password):
            raise AuthServiceError("Password must be at least 6 characters")

        otp_record = await self._auth_repository.get_latest_mobile_otp(mobile_number)
        if otp_record is None or otp_record.used or not otp_record.verified:
            raise AuthServiceError("OTP verification is required before account creation")
        expires_at = otp_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise AuthServiceError("Invalid or expired OTP. Please try again.")

        meta = otp_record.meta or {}
        email = str(meta.get("email") or "")
        username = str(meta.get("username") or "")
        full_name = meta.get("full_name")
        role_name = str(meta.get("role_name") or "Admin")

        if not email or not username:
            raise AuthServiceError("Registration details are incomplete")
        if await self._auth_repository.get_by_email(email):
            raise AuthServiceError("An account with this email already exists")
        if await self._auth_repository.get_by_username(username):
            raise AuthServiceError("An account with this username already exists")

        hashed_password = get_password_hash(password)
        created_user = await self._auth_repository.create_user(
            {
                "email": email.strip().lower(),
                "username": username.strip(),
                "hashed_password": hashed_password,
                "full_name": full_name.strip() if isinstance(full_name, str) and full_name else None,
                "mobile_number": mobile_number,
                "is_mobile_verified": True,
                "is_active": True,
                "is_superuser": False,
                "meta": {"role": role_name, "failed_attempts": 0},
            }
        )
        user_id = getattr(created_user, "id", None)
        if user_id is None and isinstance(created_user, dict):
            user_id = created_user.get("id")
        if user_id is None:
            raise AuthServiceError("Failed to create user account")
        await self._auth_repository.assign_role(user_id, role_name)
        await self._auth_repository.update_login_state(user_id, 0, None)
        await self._auth_repository.mark_mobile_otp_used(otp_record.id)

        return {
            "user": {
                "id": user_id,
                "email": getattr(created_user, "email", None) or (created_user.get("email") if isinstance(created_user, dict) else None),
                "username": getattr(created_user, "username", None) or (created_user.get("username") if isinstance(created_user, dict) else None),
                "full_name": getattr(created_user, "full_name", None) or (created_user.get("full_name") if isinstance(created_user, dict) else None),
                "role": role_name,
            }
        }

    async def login_user(
        self,
        email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> dict[str, str | int | dict[str, object]]:
        user = await self._auth_repository.get_by_email(email)
        if user is None:
            user = await self._auth_repository.get_by_username(email)

        if user is None:
            raise AuthServiceError("Invalid credentials")

        login_state = await self._auth_repository.get_login_state(user.id)
        locked_until = login_state.get("locked_until") if isinstance(login_state, dict) else None
        if isinstance(locked_until, str):
            try:
                locked_until = datetime.fromisoformat(locked_until)
            except ValueError:
                locked_until = None

        now = datetime.now(timezone.utc)
        if locked_until is not None and locked_until > now:
            raise AuthServiceError("Account temporarily locked due to repeated failed attempts")

        if not verify_password(password, user.hashed_password or ""):
            failed_attempts = int(login_state.get("failed_attempts", 0)) + 1 if isinstance(login_state, dict) else 1
            if failed_attempts >= 5:
                locked_until = now + timedelta(minutes=15)
                await self._auth_repository.update_login_state(user.id, failed_attempts, locked_until)
            else:
                await self._auth_repository.update_login_state(user.id, failed_attempts, None)
            raise AuthServiceError("Invalid credentials")

        await self._auth_repository.update_login_state(user.id, 0, None)

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
            "user": {
                "id": user.id,
                "email": user.email,
                "username": getattr(user, "username", None),
                "full_name": getattr(user, "full_name", None),
                "role": getattr(user, "meta", {}).get("role", "Admin") if isinstance(getattr(user, "meta", None), dict) else "Admin",
            },
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
        # Handle both naive and aware datetimes from database
        if session.expires_at is not None:
            expires_at = session.expires_at
            if expires_at.tzinfo is None:
                # Convert naive datetime to aware UTC for comparison
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at < datetime.now(timezone.utc):
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
