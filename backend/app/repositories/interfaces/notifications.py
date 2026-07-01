from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.notifications import Notification, NotificationTemplate
from app.repositories.interfaces.base import BaseRepository


class NotificationRepository(BaseRepository[Notification], ABC):
    @abstractmethod
    async def send_notification(self, recipient_id: int, template_id: int) -> Notification:
        raise NotImplementedError

    @abstractmethod
    async def create_template(self, template: NotificationTemplate) -> NotificationTemplate:
        raise NotImplementedError
