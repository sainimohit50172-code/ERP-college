from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.api.v1.shared.dependencies import get_auth_service
from app.schemas.auth.schemas import (
    ChangePasswordRequest,
    CurrentUser,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
)
from app.schemas.shared.base import APIResponse
from app.services.auth.service import AuthService, AuthServiceError

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


def get_bearer_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid authorization header")
    return credentials.credentials


async def get_current_user(
    token: str = Depends(get_bearer_token),
    service: AuthService = Depends(get_auth_service),
):
    try:
        user = await service.get_user_from_token(token)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return user


@router.post(
    "/login",
    response_model=APIResponse[LoginResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate and issue tokens",
    description="Validate user credentials and issue a JWT access token and refresh token.",
)
async def login(payload: LoginRequest, request: Request, service: AuthService = Depends(get_auth_service)):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    try:
        result = await service.login_user(payload.email, payload.password, user_agent=user_agent, ip_address=ip_address)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    return APIResponse(data=LoginResponse(**result), message="Authenticated")


@router.post(
    "/refresh",
    response_model=APIResponse[RefreshTokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Exchange a valid refresh token for a new access token and refresh token.",
)
async def refresh(payload: RefreshTokenRequest, request: Request, service: AuthService = Depends(get_auth_service)):
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    try:
        result = await service.refresh_tokens(payload.refresh_token, user_agent=user_agent, ip_address=ip_address)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    return APIResponse(data=RefreshTokenResponse(**result), message="Refresh token rotated")


@router.post(
    "/logout",
    response_model=APIResponse[dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="Logout user",
    description="Revoke refresh token sessions for the current user or the provided refresh token.",
)
async def logout(
    payload: Optional[RefreshTokenRequest] = None,
    current_user=Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    try:
        if payload and payload.refresh_token:
            await service.logout(refresh_token=payload.refresh_token)
        else:
            await service.logout(user_id=current_user.id)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return APIResponse(data={"success": True}, message="Logged out")


@router.get(
    "/me",
    response_model=APIResponse[CurrentUser],
    status_code=status.HTTP_200_OK,
    summary="Current authenticated user",
    description="Retrieve the currently authenticated user's profile.",
)
async def me(current_user=Depends(get_current_user)):
    return APIResponse(data=CurrentUser.from_orm(current_user), message="Current user retrieved")


@router.post(
    "/change-password",
    response_model=APIResponse[dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="Change password",
    description="Change the password for the current authenticated user.",
)
async def change_password(payload: ChangePasswordRequest, current_user=Depends(get_current_user), service: AuthService = Depends(get_auth_service)):
    try:
        await service.change_password(current_user.id, payload.current_password, payload.new_password)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return APIResponse(data={"success": True}, message="Password changed successfully")


@router.post(
    "/forgot-password",
    response_model=APIResponse[dict[str, str]],
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Request a password reset token for the given email address.",
)
async def forgot_password(payload: PasswordResetRequest, service: AuthService = Depends(get_auth_service)):
    try:
        reset_token = await service.request_password_reset(payload.email)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return APIResponse(data={"reset_token": reset_token}, message="If the account exists, a reset link was generated")


@router.post(
    "/reset-password",
    response_model=APIResponse[dict[str, bool]],
    status_code=status.HTTP_200_OK,
    summary="Reset password",
    description="Reset a user's password using a valid password reset token.",
)
async def reset_password(payload: ResetPasswordRequest, service: AuthService = Depends(get_auth_service)):
    try:
        await service.reset_password(payload.token, payload.new_password)
    except AuthServiceError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return APIResponse(data={"success": True}, message="Password reset successfully")
