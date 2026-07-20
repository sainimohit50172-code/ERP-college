from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("email must not be empty")
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("password must not be empty")
        return value


class UserSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


class LoginResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(default=3600, ge=1)
    user: Optional[UserSummary] = None


class RegisterRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)
    full_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("full_name", "fullName"))
    role_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("role_name", "role"))


class RegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserSummary


class RefreshTokenRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    refresh_token: str = Field(min_length=1)


class RefreshTokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(default=3600, ge=1)


class LogoutRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    refresh_token: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8)


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


class MobileOtpSendRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    full_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("full_name", "fullName"))
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    mobile_number: str = Field(min_length=10, max_length=10)
    role_name: Optional[str] = Field(default=None, validation_alias=AliasChoices("role_name", "role"))


class MobileOtpVerifyRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    mobile_number: str = Field(min_length=10, max_length=10, validation_alias=AliasChoices("mobile_number", "mobile"))
    otp_code: str = Field(min_length=6, max_length=6, validation_alias=AliasChoices("otp_code", "otp"))


class MobileRegistrationCompleteRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    mobile_number: str = Field(min_length=10, max_length=10, validation_alias=AliasChoices("mobile_number", "mobile"))
    password: str = Field(min_length=6)
    confirm_password: str = Field(default=..., min_length=6, validation_alias=AliasChoices("confirm_password", "confirmPassword"))


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
