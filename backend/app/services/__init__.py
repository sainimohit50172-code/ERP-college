from app.services.admissions.service import AdmissionService, AdmissionServiceError
from app.services.attendance.service import AttendanceService, AttendanceServiceError
from app.services.audit.service import AuditService, AuditServiceError
from app.services.auth.service import AuthService, AuthServiceError
from app.services.employees.service import EmployeeService, EmployeeServiceError
from app.services.examinations.service import ExaminationService, ExaminationServiceError
from app.services.fees.service import FeeService, FeeServiceError
from app.services.finance.service import FinanceService, FinanceServiceError
from app.services.hostel.service import HostelService, HostelServiceError
from app.services.inventory.service import InventoryService, InventoryServiceError
from app.services.library.service import LibraryService, LibraryServiceError
from app.services.notifications.service import NotificationService, NotificationServiceError
from app.services.procurement.service import ProcurementService, ProcurementServiceError
from app.services.students.service import StudentService, StudentServiceError
from app.services.transport.service import TransportService, TransportServiceError

__all__ = [
    "AdmissionService",
    "AdmissionServiceError",
    "AttendanceService",
    "AttendanceServiceError",
    "AuditService",
    "AuditServiceError",
    "AuthService",
    "AuthServiceError",
    "EmployeeService",
    "EmployeeServiceError",
    "ExaminationService",
    "ExaminationServiceError",
    "FeeService",
    "FeeServiceError",
    "FinanceService",
    "FinanceServiceError",
    "HostelService",
    "HostelServiceError",
    "InventoryService",
    "InventoryServiceError",
    "LibraryService",
    "LibraryServiceError",
    "NotificationService",
    "NotificationServiceError",
    "ProcurementService",
    "ProcurementServiceError",
    "StudentService",
    "StudentServiceError",
    "TransportService",
    "TransportServiceError",
]
