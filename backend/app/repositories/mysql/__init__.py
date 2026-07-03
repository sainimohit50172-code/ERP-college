from app.repositories.mysql.base import MySQLRepository
from app.repositories.mysql.auth import MySQLAuthRepository
from app.repositories.mysql.students import MySQLStudentRepository
from app.repositories.mysql.admissions import MySQLAdmissionRepository
from app.repositories.mysql.employees import MySQLEmployeeRepository
from app.repositories.mysql.attendance import MySQLAttendanceRepository
from app.repositories.mysql.fees import MySQLFeeRepository
from app.repositories.mysql.examinations import MySQLExaminationRepository
from app.repositories.mysql.library import MySQLLibraryRepository
from app.repositories.mysql.hostel import MySQLHostelRepository
from app.repositories.mysql.transport import MySQLTransportRepository
from app.repositories.mysql.finance import MySQLFinanceRepository
from app.repositories.mysql.procurement import MySQLProcurementRepository
from app.repositories.mysql.inventory import MySQLInventoryRepository
from app.repositories.mysql.notifications import MySQLNotificationRepository
from app.repositories.mysql.audit import MySQLAuditRepository
from app.repositories.mysql.teachers import MySQLTeacherRepository

__all__ = [
    "MySQLRepository",
    "MySQLAuthRepository",
    "MySQLStudentRepository",
    "MySQLAdmissionRepository",
    "MySQLEmployeeRepository",
    "MySQLAttendanceRepository",
    "MySQLFeeRepository",
    "MySQLExaminationRepository",
    "MySQLLibraryRepository",
    "MySQLHostelRepository",
    "MySQLTransportRepository",
    "MySQLFinanceRepository",
    "MySQLProcurementRepository",
    "MySQLInventoryRepository",
    "MySQLNotificationRepository",
    "MySQLAuditRepository",
    "MySQLTeacherRepository",
    "MySQLDepartmentRepository",
    "MySQLDesignationRepository",
    "MySQLAcademicYearRepository",
    "MySQLSemesterRepository",
    "MySQLCourseRepository",
    "MySQLSubjectRepository",
    "MySQLAcademicClassRepository",
    "MySQLSectionRepository",
]
