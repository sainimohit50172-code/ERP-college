from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.core.security import verify_password
from app.models.auth import AuthSession, MobileOTP, PasswordReset, Role, User, UserRole
from app.repositories.interfaces.auth import AuthRepository
from app.repositories.mysql.base import MySQLRepository
from app.repositories.interfaces.base import RepositoryError


class MySQLAuthRepository(MySQLRepository[User], AuthRepository):
    def __init__(self, session):
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.email == email)
            result = self.session.scalars(stmt).first()
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def get_by_username(self, username: str) -> Optional[User]:
        try:
            stmt = select(User).where(User.username == username)
            result = self.session.scalars(stmt).first()
            return result
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        try:
            user = await self.get_by_email(email)
            if user is None or user.hashed_password is None:
                return None
            return user if verify_password(password, user.hashed_password) else None
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def create_user(self, payload: dict) -> User:
        try:
            user = User(**payload)
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def assign_role(self, user_id: int, role_name: str) -> bool:
        try:
            role = self.session.scalars(select(Role).where(Role.name == role_name)).first()
            if role is None:
                role = Role(name=role_name, description=f"Auto-assigned {role_name}", is_builtin=False)
                self.session.add(role)
                self.session.flush()
            assignment = UserRole(user_id=user_id, role_id=role.id)
            self.session.add(assignment)
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def update_login_state(self, user_id: int, failed_attempts: int, locked_until: Optional[datetime]) -> bool:
        try:
            user = await self.get_by_id(user_id)
            if user is None:
                return False
            user.meta = {**(user.meta or {}), "failed_attempts": failed_attempts, "locked_until": locked_until.isoformat() if locked_until else None}
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def get_login_state(self, user_id: int) -> dict:
        try:
            user = await self.get_by_id(user_id)
            if user is None:
                return {"failed_attempts": 0, "locked_until": None}
            meta = user.meta or {}
            return {
                "failed_attempts": int(meta.get("failed_attempts", 0)),
                "locked_until": meta.get("locked_until"),
            }
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def change_password(self, user_id: int, new_password: str) -> bool:
        try:
            user = await self.get_by_id(user_id)
            if user is None:
                return False
            user.hashed_password = new_password
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def create_refresh_session(
        self,
        user_id: int,
        refresh_token_hash: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuthSession:
        try:
            session = AuthSession(
                id=str(uuid4()),
                user_id=user_id,
                refresh_token_hash=refresh_token_hash,
                user_agent=user_agent,
                ip_address=ip_address,
                expires_at=expires_at,
                revoked=False,
            )
            self.session.add(session)
            self.session.commit()
            self.session.refresh(session)
            return session
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def get_refresh_session(self, refresh_token_hash: str) -> Optional[AuthSession]:
        try:
            stmt = select(AuthSession).where(AuthSession.refresh_token_hash == refresh_token_hash)
            return self.session.scalars(stmt).first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def rotate_refresh_token(
        self,
        old_refresh_token_hash: str,
        new_refresh_token_hash: str,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Optional[AuthSession]:
        try:
            old_session = await self.get_refresh_session(old_refresh_token_hash)
            if old_session is None:
                return None
            old_session.revoked = True
            new_session = AuthSession(
                id=str(uuid4()),
                user_id=old_session.user_id,
                refresh_token_hash=new_refresh_token_hash,
                user_agent=user_agent or old_session.user_agent,
                ip_address=ip_address or old_session.ip_address,
                expires_at=expires_at,
                revoked=False,
            )
            self.session.add(new_session)
            self.session.commit()
            self.session.refresh(new_session)
            return new_session
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def revoke_refresh_token(self, refresh_token_hash: str) -> bool:
        try:
            session = await self.get_refresh_session(refresh_token_hash)
            if session is None:
                return False
            session.revoked = True
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def revoke_user_refresh_sessions(self, user_id: int) -> int:
        try:
            stmt = select(AuthSession).where(AuthSession.user_id == user_id, AuthSession.revoked == False)
            sessions = self.session.scalars(stmt).all()
            for session in sessions:
                session.revoked = True
            self.session.commit()
            return len(sessions)
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def create_mobile_otp(
        self,
        mobile_number: str,
        otp_code: str,
        expires_at: datetime,
        meta: Optional[dict] = None,
    ) -> MobileOTP:
        try:
            otp_record = MobileOTP(
                id=str(uuid4()),
                mobile_number=mobile_number,
                otp_code=otp_code,
                expires_at=expires_at,
                verified=False,
                used=False,
                meta=meta,
            )
            self.session.add(otp_record)
            self.session.commit()
            self.session.refresh(otp_record)
            return otp_record
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def get_latest_mobile_otp(self, mobile_number: str) -> Optional[MobileOTP]:
        try:
            stmt = (
                select(MobileOTP)
                .where(MobileOTP.mobile_number == mobile_number)
                .order_by(MobileOTP.created_at.desc())
            )
            return self.session.scalars(stmt).first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def mark_mobile_otp_verified(self, otp_id: str) -> bool:
        try:
            otp_record = self.session.get(MobileOTP, otp_id)
            if otp_record is None:
                return False
            otp_record.verified = True
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def mark_mobile_otp_used(self, otp_id: str) -> bool:
        try:
            otp_record = self.session.get(MobileOTP, otp_id)
            if otp_record is None:
                return False
            otp_record.used = True
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def create_password_reset(
        self,
        user_id: int,
        token_hash: str,
        expires_at: datetime,
    ) -> PasswordReset:
        try:
            reset_record = PasswordReset(
                id=str(uuid4()),
                user_id=user_id,
                token_hash=token_hash,
                expires_at=expires_at,
                used=False,
            )
            self.session.add(reset_record)
            self.session.commit()
            self.session.refresh(reset_record)
            return reset_record
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc

    async def get_password_reset(self, token_hash: str) -> Optional[PasswordReset]:
        try:
            stmt = select(PasswordReset).where(PasswordReset.token_hash == token_hash)
            return self.session.scalars(stmt).first()
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def mark_password_reset_used(self, reset_id: str) -> bool:
        try:
            reset_record = self.session.get(PasswordReset, reset_id)
            if reset_record is None:
                return False
            reset_record.used = True
            self.session.commit()
            return True
        except SQLAlchemyError as exc:
            self.session.rollback()
            raise RepositoryError(str(exc)) from exc
