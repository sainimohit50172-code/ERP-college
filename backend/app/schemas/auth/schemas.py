from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: str = Field(min_length=8)


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(default=3600, ge=1)


class RefreshTokenRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    refresh_token: str = Field(min_length=1)


class RefreshTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(default=3600, ge=1)


class TokenPayload(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sub: str
    email: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None
    scope: Optional[str] = None


class CurrentUser(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class PasswordResetRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr


class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    password: Optional[str] = Field(default=None, min_length=8)


class UserDetail(UserBase):
    id: int


class UserListItem(UserBase):
    id: int


class UserResponse(UserBase):
    id: int


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        if value == "password":
            raise ValueError("new_password must not be password")
        return value
