from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.admissions import AdmissionRepository


class AdmissionServiceError(Exception):
    """Raised when admission workflow operations fail."""


@dataclass(slots=True)
class AdmissionDTO:
    id: Optional[int]
    applicant_name: str
    email: Optional[str]
    status: str


class AdmissionService:
    def __init__(self, admission_repository: AdmissionRepository) -> None:
        self._admission_repository = admission_repository

    async def create_application(self, applicant_name: str, email: Optional[str], status: str = "Applied") -> AdmissionDTO:
        if not applicant_name.strip():
            raise AdmissionServiceError("Applicant name is required")

        return AdmissionDTO(id=None, applicant_name=applicant_name, email=email, status=status)
