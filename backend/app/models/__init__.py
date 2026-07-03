from app.db.database import Base
from app.models.auth.models import (
    AuthSession,
    EmailVerification,
    PasswordReset,
    Permission,
    Role,
    RolePermission,
    User,
    UserRole,
)
from app.models.academic.models import (
    AcademicClass,
    AcademicYear,
    Course,
    Department,
    Designation,
    Section,
    Semester,
    Subject,
)
from app.models.admissions.models import Admission
from app.models.attendance.models import AttendanceRecord
from app.models.audit.models import AuditLog
from app.models.employees.models import (
    Employee,
    LeaveRequest,
    LeaveType,
    PayrollEntry,
    PayrollRun,
)
from app.models.examinations.models import Exam, ExamResult
from app.models.finance.models import (
    Budget,
    ChartAccount,
    JournalEntry,
    JournalLine,
    LedgerAccount,
    Payment,
    Receipt,
)
from app.models.hostel.models import Bed, Complaint, Hostel, HostelAllocation, Room, Visitor
from app.models.inventory.models import AssetRegister, InventoryItem, Stock, StockMovement, Warehouse
from app.models.library.models import BookCopy, BookIssue, Fine, LibraryItem, Reservation
from app.models.notifications.models import Notification
from app.models.procurement.models import (
    GoodsReceipt,
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseRequest,
    Supplier,
)
from app.models.students.models import Guardian, Student, StudentAssignment
from app.models.transport.models import Driver, Route, RouteStop, Vehicle, VehicleAssignment
from app.models.teachers.models import Teacher

__all__ = [
    "AcademicClass",
    "AcademicYear",
    "Base",
    "Admission",
    "AssetRegister",
    "AttendanceRecord",
    "AuditLog",
    "AuthSession",
    "Bed",
    "Budget",
    "BookCopy",
    "BookIssue",
    "ChartAccount",
    "Complaint",
    "Course",
    "Department",
    "Designation",
    "Driver",
    "EmailVerification",
    "Employee",
    "Exam",
    "ExamResult",
    "Fine",
    "GoodsReceipt",
    "Guardian",
    "Hostel",
    "HostelAllocation",
    "InventoryItem",
    "JournalEntry",
    "JournalLine",
    "LedgerAccount",
    "LeaveRequest",
    "LeaveType",
    "LibraryItem",
    "Notification",
    "PasswordReset",
    "Payment",
    "Permission",
    "PayrollEntry",
    "PayrollRun",
    "PurchaseOrder",
    "PurchaseOrderLine",
    "PurchaseRequest",
    "Receipt",
    "Reservation",
    "Role",
    "RolePermission",
    "Room",
    "Route",
    "RouteStop",
    "Section",
    "Semester",
    "Stock",
    "StockMovement",
    "Student",
    "StudentAssignment",
    "Subject",
    "Teacher",
    "User",
    "UserRole",
    "Vehicle",
    "VehicleAssignment",
    "Supplier",
    "Visitor",
    "Warehouse",
]
