from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.hostel import HostelRepository


class HostelServiceError(Exception):
    """Raised when hostel operations fail."""


@dataclass(slots=True)
class HostelAllocationDTO:
    allocation_id: int | None
    student_id: int
    room_id: int
    status: str = "Allocated"


class HostelService:
    def __init__(self, hostel_repository: HostelRepository) -> None:
        self._hostel_repository = hostel_repository

    async def allocate_room(self, student_id: int, room_id: int) -> HostelAllocationDTO:
        if student_id <= 0 or room_id <= 0:
            raise HostelServiceError("Student and room identifiers must be positive")

        return HostelAllocationDTO(allocation_id=None, student_id=student_id, room_id=room_id)
