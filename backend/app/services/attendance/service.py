from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.attendance import AttendanceRepository


class AttendanceServiceError(Exception):
    """Raised when attendance operations fail."""


@dataclass(slots=True)
class AttendanceSummaryDTO:
    student_id: int
    present: int
    absent: int
    late: int


class AttendanceService:
    def __init__(self, attendance_repository: AttendanceRepository) -> None:
        self._attendance_repository = attendance_repository

    async def get_attendance_summary(self, student_id: int) -> AttendanceSummaryDTO:
        summary = await self._attendance_repository.get_attendance_summary(student_id)
        return AttendanceSummaryDTO(
            student_id=student_id,
            present=summary.get("present", 0),
            absent=summary.get("absent", 0),
            late=summary.get("late", 0),
        )
