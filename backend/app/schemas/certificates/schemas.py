from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class CertificateBase(BaseModel):
    student_id: int
    certificate_type: str
    issue_date: Optional[date]
    status: Optional[str] = "Draft"
    remarks: Optional[str]


class CertificateCreate(CertificateBase):
    pass


class CertificateUpdate(CertificateBase):
    pass


class CertificateDetail(CertificateBase):
    id: int
    created_by: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
