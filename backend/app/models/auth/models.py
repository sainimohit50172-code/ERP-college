from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    username: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    mobile_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_mobile_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    updated_by: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    roles: Mapped[list["UserRole"]] = relationship(back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    created_departments: Mapped[list["Department"]] = relationship(back_populates="created_by_user", foreign_keys="Department.created_by", lazy="selectin")
    updated_departments: Mapped[list["Department"]] = relationship(back_populates="updated_by_user", foreign_keys="Department.updated_by", lazy="selectin")
    admissions_created: Mapped[list["Admission"]] = relationship(back_populates="created_by_user", foreign_keys="Admission.created_by", lazy="selectin")
    admissions_updated: Mapped[list["Admission"]] = relationship(back_populates="updated_by_user", foreign_keys="Admission.updated_by", lazy="selectin")
    students_created: Mapped[list["Student"]] = relationship(back_populates="created_by_user", foreign_keys="Student.created_by", lazy="selectin")
    students_updated: Mapped[list["Student"]] = relationship(back_populates="updated_by_user", foreign_keys="Student.updated_by", lazy="selectin")
    employees: Mapped[list["Employee"]] = relationship(back_populates="user", foreign_keys="Employee.user_id", lazy="selectin")
    auth_sessions: Mapped[list["AuthSession"]] = relationship(back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    password_resets: Mapped[list["PasswordReset"]] = relationship(back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    email_verifications: Mapped[list["EmailVerification"]] = relationship(back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user", lazy="selectin")
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="actor", lazy="selectin")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_builtin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    role_permissions: Mapped[list["RolePermission"]] = relationship(back_populates="role", cascade="all, delete-orphan", lazy="selectin")
    user_roles: Mapped[list["UserRole"]] = relationship(back_populates="role", cascade="all, delete-orphan", lazy="selectin")


class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    role_permissions: Mapped[list["RolePermission"]] = relationship(back_populates="permission", cascade="all, delete-orphan", lazy="selectin")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("permissions.id"), primary_key=True)

    role: Mapped[Role] = relationship(back_populates="role_permissions", lazy="selectin")
    permission: Mapped[Permission] = relationship(back_populates="role_permissions", lazy="selectin")


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), primary_key=True)
    role_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("roles.id"), primary_key=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="roles", lazy="selectin")
    role: Mapped[Role] = relationship(back_populates="user_roles", lazy="selectin")


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    refresh_token_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    revoked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="auth_sessions", lazy="selectin")


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="password_resets", lazy="selectin")


class MobileOTP(Base):
    __tablename__ = "mobile_otps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    otp_code: Mapped[str] = mapped_column(String(10), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)
    used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)

    user: Mapped[User] = relationship(back_populates="email_verifications", lazy="selectin")
