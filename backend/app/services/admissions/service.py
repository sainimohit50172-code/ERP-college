from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.repositories.interfaces.admissions import AdmissionCategoryRepository, AdmissionRepository


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


class AdmissionCategoryService:
    def __init__(self, admission_category_repository: AdmissionCategoryRepository) -> None:
        self._admission_category_repository = admission_category_repository
