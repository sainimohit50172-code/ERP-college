from __future__ import annotations

from dataclasses import dataclass

from app.repositories.interfaces.procurement import ProcurementRepository


class ProcurementServiceError(Exception):
    """Raised when procurement workflow operations fail."""


@dataclass(slots=True)
class PurchaseRequestDTO:
    request_id: int | None
    title: str
    status: str = "Draft"


class ProcurementService:
    def __init__(self, procurement_repository: ProcurementRepository) -> None:
        self._procurement_repository = procurement_repository

    async def create_request(self, title: str) -> PurchaseRequestDTO:
        if not title.strip():
            raise ProcurementServiceError("Purchase request title is required")

        return PurchaseRequestDTO(request_id=None, title=title)
