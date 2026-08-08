from __future__ import annotations

from app.models.admissions import AdmissionCategory
from app.repositories.interfaces.admissions import AdmissionCategoryRepository
from app.repositories.mysql.base import MySQLRepository


class MySQLAdmissionCategoryRepository(MySQLRepository[AdmissionCategory], AdmissionCategoryRepository):
    def __init__(self, session):
        super().__init__(session, AdmissionCategory)
