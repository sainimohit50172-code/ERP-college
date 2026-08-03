from __future__ import annotations

from datetime import date
from typing import Any, Optional

from app.repositories.interfaces.base import RepositoryError


class ExamFormServiceError(Exception):
    pass


class ExamFormService:
    def __init__(self, repository, model_type, full_schema=None, default_actor="System Administrator"):
        self.repository = repository
        self.model_type = model_type
        self.full_schema = full_schema
        self.default_actor = default_actor

    async def list(self, page: int, page_size: int, query: Optional[str] = None, status: Optional[str] = None, exam_type: Optional[str] = None, institute: Optional[str] = None, sort_by: str = "created_at", sort_order: str = "desc"):
        return await self.repository.list_records(page, page_size, query, status, exam_type, institute, sort_by, sort_order)

    async def get(self, entity_id: int):
        item = await self.repository.get_active(entity_id)
        if item is None:
            raise ExamFormServiceError("Record not found")
        return item

    async def create(self, payload):
        values = payload.model_dump(by_alias=False, exclude_unset=True)
        if hasattr(self.model_type, "created_date"):
            values.setdefault("created_date", date.today())
        if self.default_actor is not None:
            values.setdefault("created_by", self.default_actor)
        entity = self.model_type(**values)
        try:
            return await self.repository.create(entity)
        except RepositoryError as exc:
            raise ExamFormServiceError(str(exc)) from exc

    async def update(self, entity_id: int, payload):
        item = await self.get(entity_id)
        values = payload.model_dump(by_alias=False, exclude_unset=True)
        if hasattr(self.model_type, "updated_date"):
            values["updated_date"] = values.get("updated_date") or date.today()
        if self.default_actor is not None:
            values["updated_by"] = values.get("updated_by") or self.default_actor
        if self.full_schema is not None:
            current_values = {key: getattr(item, key, None) for key in self.full_schema.model_fields}
            current_values.update(values)
            current_values.pop("created_at", None)
            current_values.pop("updated_at", None)
            self.full_schema.model_validate(current_values)
        for key, value in values.items():
            setattr(item, key, value)
        try:
            await self.repository._commit()
            await self.repository._refresh(item)
            return item
        except RepositoryError as exc:
            raise ExamFormServiceError(str(exc)) from exc

    async def delete(self, entity_id: int):
        try:
            if not await self.repository.soft_delete(entity_id):
                raise ExamFormServiceError("Record not found")
            return True
        except RepositoryError as exc:
            raise ExamFormServiceError(str(exc)) from exc
