from app.repositories.interfaces.base import BaseRepository, RepositoryError
from app.repositories.interfaces.auth import AuthRepository
from app.repositories.interfaces.students import StudentRepository
from app.repositories.interfaces.admissions import AdmissionRepository
from app.repositories.interfaces.employees import EmployeeRepository
from app.repositories.interfaces.attendance import AttendanceRepository
from app.repositories.interfaces.fees import FeeRepository
from app.repositories.interfaces.examinations import ExaminationRepository
from app.repositories.interfaces.library import LibraryRepository
from app.repositories.interfaces.hostel import HostelRepository
from app.repositories.interfaces.transport import TransportRepository
from app.repositories.interfaces.finance import FinanceRepository
from app.repositories.interfaces.procurement import ProcurementRepository
from app.repositories.interfaces.inventory import InventoryRepository
from app.repositories.interfaces.notifications import NotificationRepository
from app.repositories.interfaces.audit import AuditRepository

__all__ = [
    "BaseRepository",
    "RepositoryError",
    "AuthRepository",
    "StudentRepository",
    "AdmissionRepository",
    "EmployeeRepository",
    "AttendanceRepository",
    "FeeRepository",
    "ExaminationRepository",
    "LibraryRepository",
    "HostelRepository",
    "TransportRepository",
    "FinanceRepository",
    "ProcurementRepository",
    "InventoryRepository",
    "NotificationRepository",
    "AuditRepository",
]
