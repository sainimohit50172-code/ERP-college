from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from app.models.notifications import Notification, NotificationTemplate
from app.repositories.interfaces.base import RepositoryError
from app.repositories.interfaces.notifications import NotificationRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLNotificationRepository(MySQLRepository[Notification], NotificationRepository):
    def __init__(self, session):
        super().__init__(session, Notification)

    async def unread_notifications(self) -> list[Notification]:
        try:
            stmt = select(Notification).where(Notification.is_read.is_(False))
            result = await self._run_sync(lambda: self.session.scalars(stmt).all())
            return list(result)
        except SQLAlchemyError as exc:
            raise RepositoryError(str(exc)) from exc

    async def send_notification(self, recipient_id: int, template_id: int) -> Notification:
        notification = Notification(user_id=recipient_id, template_id=template_id, message="")
        self.session.add(notification)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(notification))
        return notification

    async def create_template(self, template: NotificationTemplate) -> NotificationTemplate:
        self.session.add(template)
        await self._run_sync(lambda: self.session.commit())
        await self._run_sync(lambda: self.session.refresh(template))
        return template
