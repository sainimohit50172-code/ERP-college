from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.notifications import NotificationRepository


class NotificationServiceError(Exception):
    """Raised when notification dispatch operations fail."""


@dataclass(slots=True)
class NotificationDTO:
    notification_id: Optional[int]
    recipient_id: int
    message: str
    status: str = "Queued"


class NotificationService:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self._notification_repository = notification_repository

    async def dispatch(self, recipient_id: int, message: str) -> NotificationDTO:
        if recipient_id <= 0:
            raise NotificationServiceError("Recipient identifier must be positive")
        if not message.strip():
            raise NotificationServiceError("Notification message is required")

        return NotificationDTO(notification_id=None, recipient_id=recipient_id, message=message)
