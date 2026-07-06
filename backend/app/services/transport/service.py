from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.transport import TransportRepository


class TransportServiceError(Exception):
    """Raised when transport operations fail."""


@dataclass(slots=True)
class TransportAllocationDTO:
    allocation_id: int | None
    student_id: int
    vehicle_id: int
    status: str = "Assigned"


class TransportService:
    def __init__(self, transport_repository: TransportRepository) -> None:
        self._transport_repository = transport_repository

    async def allocate_vehicle(self, student_id: int, vehicle_id: int) -> TransportAllocationDTO:
        if student_id <= 0 or vehicle_id <= 0:
            raise TransportServiceError("Student and vehicle identifiers must be positive")

        return TransportAllocationDTO(allocation_id=None, student_id=student_id, vehicle_id=vehicle_id)


class DriverService:
    def __init__(self, repo):
        self._repo = repo


class RouteService:
    def __init__(self, repo):
        self._repo = repo


class RouteStopService:
    def __init__(self, repo):
        self._repo = repo


class TransportAssignmentService:
    def __init__(self, repo):
        self._repo = repo


class VehicleAssignmentService:
    def __init__(self, repo):
        self._repo = repo
