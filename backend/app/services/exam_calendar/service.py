from __future__ import annotations

import csv
import io
from datetime import datetime, timezone
from typing import Any, Optional

from app.models.exam_calendar import ExamCalendar
from app.repositories.interfaces.exam_calendar import ExamCalendarRepository
from app.schemas.exam_calendar.schemas import ExamCalendarCreate, ExamCalendarUpdate


class ExamCalendarServiceError(Exception):
    """Raised when exam calendar service operations fail."""


class ExamCalendarService:
    def __init__(self, repository: ExamCalendarRepository) -> None:
        self._repository = repository

    async def list_exam_calendars(
        self,
        page: int,
        page_size: int,
        sort_by: Optional[str] = None,
        sort_order: str = "asc",
        academic_session: Optional[str] = None,
        exam_type: Optional[str] = None,
        exam_category: Optional[str] = None,
        status: Optional[str] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> tuple[list[ExamCalendar], int]:
        start_date_value = self._parse_date(start_date)
        end_date_value = self._parse_date(end_date)
        return await self._repository.list_records(
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
            academic_session=academic_session,
            exam_type=exam_type,
            exam_category=exam_category,
            status=status,
            created_by=created_by,
            updated_by=updated_by,
            start_date=start_date_value,
            end_date=end_date_value,
        )

    async def search_exam_calendars(
        self,
        query: str,
        academic_session: Optional[str] = None,
        exam_type: Optional[str] = None,
        exam_category: Optional[str] = None,
        status: Optional[str] = None,
        created_by: Optional[str] = None,
        updated_by: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> list[ExamCalendar]:
        start_date_value = self._parse_date(start_date)
        end_date_value = self._parse_date(end_date)
        return await self._repository.search_records(
            query=query,
            academic_session=academic_session,
            exam_type=exam_type,
            exam_category=exam_category,
            status=status,
            created_by=created_by,
            updated_by=updated_by,
            start_date=start_date_value,
            end_date=end_date_value,
        )

    async def create_exam_calendar(self, payload: ExamCalendarCreate) -> ExamCalendar:
        await self._validate_unique(payload.exam_name, payload.academic_session, None)
        entity = ExamCalendar(
            exam_name=payload.exam_name,
            academic_session=payload.academic_session,
            exam_type=payload.exam_type,
            exam_category=payload.exam_category,
            start_date=payload.start_date,
            end_date=payload.end_date,
            description=payload.description,
            status=payload.status or "Upcoming",
            created_by=payload.created_by,
            updated_by=payload.updated_by,
            created_date=payload.created_date,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        return await self._repository.create(entity)

    async def update_exam_calendar(self, entity_id: int, payload: ExamCalendarUpdate) -> Optional[ExamCalendar]:
        existing = await self._repository.get_by_id(entity_id)
        if existing is None:
            return None

        new_name = payload.exam_name if payload.exam_name is not None else existing.exam_name
        new_session = payload.academic_session if payload.academic_session is not None else existing.academic_session
        await self._validate_unique(new_name, new_session, entity_id)

        if payload.exam_name is not None:
            existing.exam_name = payload.exam_name
        if payload.academic_session is not None:
            existing.academic_session = payload.academic_session
        if payload.exam_type is not None:
            existing.exam_type = payload.exam_type
        if payload.exam_category is not None:
            existing.exam_category = payload.exam_category
        if payload.start_date is not None:
            existing.start_date = payload.start_date
        if payload.end_date is not None:
            existing.end_date = payload.end_date
        if payload.description is not None:
            existing.description = payload.description
        if payload.status is not None:
            existing.status = payload.status
        if payload.created_by is not None:
            existing.created_by = payload.created_by
        if payload.updated_by is not None:
            existing.updated_by = payload.updated_by
        if payload.created_date is not None:
            existing.created_date = payload.created_date

        existing.updated_at = datetime.now(timezone.utc)
        return await self._repository.update(entity_id, existing)

    async def delete_exam_calendar(self, entity_id: int, deleted_by: Optional[str] = None) -> bool:
        existing = await self._repository.get_by_id(entity_id)
        if existing is None:
            return False
        if deleted_by is not None:
            existing.deleted_by = deleted_by
        existing.updated_at = datetime.now(timezone.utc)
        existing.deleted_at = datetime.now(timezone.utc)
        await self._repository.update(entity_id, existing)
        return True

    async def bulk_delete(self, ids: list[int], deleted_by: Optional[str] = None) -> dict[str, Any]:
        success = []
        failures = []
        for entity_id in ids:
            try:
                deleted = await self.delete_exam_calendar(entity_id, deleted_by=deleted_by)
                if deleted:
                    success.append(entity_id)
                else:
                    failures.append({"id": entity_id, "reason": "not_found"})
            except Exception as exc:  # pragma: no cover - defensive path
                failures.append({"id": entity_id, "reason": str(exc)})
        return {"success_count": len(success), "failure_count": len(failures), "success_ids": success, "failures": failures}

    async def bulk_status_update(self, ids: list[int], status: str, updated_by: Optional[str] = None) -> dict[str, Any]:
        success = []
        failures = []
        for entity_id in ids:
            try:
                existing = await self._repository.get_by_id(entity_id)
                if existing is None:
                    failures.append({"id": entity_id, "reason": "not_found"})
                    continue
                existing.status = status
                if updated_by is not None:
                    existing.updated_by = updated_by
                existing.updated_at = datetime.now(timezone.utc)
                await self._repository.update(entity_id, existing)
                success.append(entity_id)
            except Exception as exc:  # pragma: no cover - defensive path
                failures.append({"id": entity_id, "reason": str(exc)})
        return {"success_count": len(success), "failure_count": len(failures), "success_ids": success, "failures": failures}

    async def get_exam_calendar(self, entity_id: int) -> Optional[ExamCalendar]:
        return await self._repository.get_by_id(entity_id)

    async def get_audit_history(self) -> list[dict[str, Any]]:
        items = await self._repository.get_all(include_deleted=True)
        return [
            {
                "id": item.id,
                "examName": item.exam_name,
                "academicSession": item.academic_session,
                "status": item.status,
                "createdBy": item.created_by,
                "updatedAt": item.updated_at,
                "createdAt": item.created_at,
                "deletedAt": item.deleted_at,
                "updatedBy": item.updated_by,
                "deletedBy": item.deleted_by,
            }
            for item in items
        ]

    async def get_stats(self) -> dict[str, int]:
        items = await self._repository.get_all()
        return {
            "totalExams": len(items),
            "upcomingExams": sum(1 for item in items if item.status.lower() == "upcoming"),
            "ongoingExams": sum(1 for item in items if item.status.lower() == "ongoing"),
            "completedExams": sum(1 for item in items if item.status.lower() == "completed"),
            "cancelledExams": sum(1 for item in items if item.status.lower() == "cancelled"),
            "draftExams": sum(1 for item in items if item.status.lower() == "draft"),
        }

    async def export_report(self, format_name: str, filters: Optional[dict[str, Any]] = None) -> str:
        items, _ = await self.list_exam_calendars(page=1, page_size=1000, **(filters or {}))
        if format_name.lower() == "csv":
            output = io.StringIO()
            writer = csv.DictWriter(
                output,
                fieldnames=["exam_name", "academic_session", "exam_type", "exam_category", "status", "start_date", "end_date", "created_by"],
            )
            writer.writeheader()
            for item in items:
                writer.writerow(
                    {
                        "exam_name": item.exam_name,
                        "academic_session": item.academic_session,
                        "exam_type": item.exam_type,
                        "exam_category": item.exam_category or "",
                        "status": item.status,
                        "start_date": item.start_date.isoformat() if item.start_date else "",
                        "end_date": item.end_date.isoformat() if item.end_date else "",
                        "created_by": item.created_by or "",
                    }
                )
            return output.getvalue()
        return ""

    async def _validate_unique(self, exam_name: str, academic_session: str, exclude_id: Optional[int]) -> None:
        duplicate = await self._repository.get_by_name_and_session(exam_name, academic_session, exclude_id)
        if duplicate is not None:
            raise ExamCalendarServiceError("A duplicate exam name is not allowed within the same academic session.")

    def _parse_date(self, value: Optional[str]):
        if not value:
            return None
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            return None
