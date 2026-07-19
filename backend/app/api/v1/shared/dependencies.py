from fastapi import Depends

from app.db.database import get_db
from app.repositories.mysql.admissions import MySQLAdmissionRepository
from app.repositories.mysql.auth import MySQLAuthRepository
from app.repositories.mysql.attendance import MySQLAttendanceRepository
from app.repositories.mysql.audit import MySQLAuditRepository
from app.repositories.mysql.employees import MySQLEmployeeRepository
from app.repositories.mysql.examinations import MySQLExaminationRepository
from app.repositories.mysql.fees import MySQLFeeRepository
from app.repositories.mysql.finance import MySQLFinanceRepository
from app.repositories.mysql.hostel import MySQLHostelRepository
from app.repositories.mysql.inventory import MySQLInventoryRepository
from app.repositories.mysql.library import MySQLLibraryRepository
from app.repositories.mysql.notifications import MySQLNotificationRepository
from app.repositories.mysql.procurement import MySQLProcurementRepository
from app.repositories.mysql.students import MySQLStudentRepository
from app.repositories.mysql.transport import MySQLTransportRepository
from app.repositories.mysql.teachers import MySQLTeacherRepository
from app.repositories.mysql.academic import (
    MySQLDepartmentRepository,
    MySQLDesignationRepository,
    MySQLAcademicYearRepository,
    MySQLSemesterRepository,
    MySQLCourseRepository,
    MySQLSubjectRepository,
    MySQLAcademicClassRepository,
    MySQLSectionRepository,
)
from app.services.admissions.service import AdmissionService
from app.services.attendance.service import AttendanceService
from app.services.audit.service import AuditService
from app.services.auth.service import AuthService
from app.services.employees.service import EmployeeService
from app.services.examinations.service import ExaminationService
from app.services.fees.service import FeeService
from app.services.finance.service import FinanceService
from app.services.hostel.service import HostelService
from app.services.inventory.service import InventoryService
from app.services.library.service import LibraryService
from app.services.notifications.service import NotificationService
from app.services.procurement.service import ProcurementService
from app.services.students.service import StudentService
from app.services.transport.service import TransportService
from app.services.academic.service import AcademicService
from app.services.helpdesk.service import TicketService, TicketAttachmentService
from app.services.teachers.service import TeacherService
from app.repositories.mysql.helpdesk import (
    MySQLTicketAttachmentRepository,
    MySQLTicketRepository,
)


def get_admission_repository(db=Depends(get_db)):
    return MySQLAdmissionRepository(db)


def get_student_repository(db=Depends(get_db)):
    return MySQLStudentRepository(db)


def get_employee_repository(db=Depends(get_db)):
    return MySQLEmployeeRepository(db)


def get_attendance_repository(db=Depends(get_db)):
    return MySQLAttendanceRepository(db)


def get_fee_repository(db=Depends(get_db)):
    return MySQLFeeRepository(db)


def get_examination_repository(db=Depends(get_db)):
    return MySQLExaminationRepository(db)


def get_library_repository(db=Depends(get_db)):
    return MySQLLibraryRepository(db)


def get_library_entity_repository(db=Depends(get_db)):
    from app.repositories.mysql.library import MySQLLibraryEntityRepository

    return MySQLLibraryEntityRepository(db)


def get_book_copy_repository(db=Depends(get_db)):
    from app.repositories.mysql.library import MySQLBookCopyRepository

    return MySQLBookCopyRepository(db)


def get_book_issue_repository(db=Depends(get_db)):
    from app.repositories.mysql.library import MySQLBookIssueRepository

    return MySQLBookIssueRepository(db)


def get_reservation_repository(db=Depends(get_db)):
    from app.repositories.mysql.library import MySQLReservationRepository

    return MySQLReservationRepository(db)


def get_fine_repository(db=Depends(get_db)):
    from app.repositories.mysql.library import MySQLFineRepository

    return MySQLFineRepository(db)


def get_hostel_repository(db=Depends(get_db)):
    return MySQLHostelRepository(db)


def get_hostel_entity_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLHostelEntityRepository

    return MySQLHostelEntityRepository(db)


def get_room_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLRoomRepository

    return MySQLRoomRepository(db)


def get_bed_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLBedRepository

    return MySQLBedRepository(db)


def get_hostel_allocation_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLHostelAllocationRepository

    return MySQLHostelAllocationRepository(db)


def get_complaint_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLComplaintRepository

    return MySQLComplaintRepository(db)


def get_visitor_repository(db=Depends(get_db)):
    from app.repositories.mysql.hostel import MySQLVisitorRepository

    return MySQLVisitorRepository(db)


def get_transport_repository(db=Depends(get_db)):
    return MySQLTransportRepository(db)


def get_transport_entity_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLTransportEntityRepository

    return MySQLTransportEntityRepository(db)


def get_driver_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLDriverRepository

    return MySQLDriverRepository(db)


def get_route_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLRouteRepository

    return MySQLRouteRepository(db)


def get_route_stop_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLRouteStopRepository

    return MySQLRouteStopRepository(db)


def get_transport_assignment_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLTransportAssignmentRepository

    return MySQLTransportAssignmentRepository(db)


def get_vehicle_assignment_repository(db=Depends(get_db)):
    from app.repositories.mysql.transport import MySQLVehicleAssignmentRepository

    return MySQLVehicleAssignmentRepository(db)


def get_notification_repository(db=Depends(get_db)):
    return MySQLNotificationRepository(db)


def get_procurement_repository(db=Depends(get_db)):
    return MySQLProcurementRepository(db)


def get_inventory_repository(db=Depends(get_db)):
    return MySQLInventoryRepository(db)


def get_finance_repository(db=Depends(get_db)):
    return MySQLFinanceRepository(db)


def get_audit_repository(db=Depends(get_db)):
    return MySQLAuditRepository(db)


def get_department_repository(db=Depends(get_db)):
    return MySQLDepartmentRepository(db)


def get_designation_repository(db=Depends(get_db)):
    return MySQLDesignationRepository(db)


def get_academic_year_repository(db=Depends(get_db)):
    return MySQLAcademicYearRepository(db)


def get_semester_repository(db=Depends(get_db)):
    return MySQLSemesterRepository(db)


def get_course_repository(db=Depends(get_db)):
    return MySQLCourseRepository(db)


def get_subject_repository(db=Depends(get_db)):
    return MySQLSubjectRepository(db)


def get_academic_class_repository(db=Depends(get_db)):
    return MySQLAcademicClassRepository(db)


def get_section_repository(db=Depends(get_db)):
    return MySQLSectionRepository(db)


def get_auth_repository(db=Depends(get_db)):
    return MySQLAuthRepository(db)


def get_admission_service(repo=Depends(get_admission_repository)):
    return AdmissionService(repo)


def get_student_service(repo=Depends(get_student_repository)):
    return StudentService(repo)


def get_employee_service(repo=Depends(get_employee_repository)):
    return EmployeeService(repo)


def get_attendance_service(repo=Depends(get_attendance_repository)):
    return AttendanceService(repo)


def get_fee_service(repo=Depends(get_fee_repository)):
    return FeeService(repo)


def get_examination_service(repo=Depends(get_examination_repository)):
    return ExaminationService(repo)


def get_library_service(repo=Depends(get_library_repository)):
    return LibraryService(repo)


def get_library_entity_service(repo=Depends(get_library_entity_repository)):
    from app.services.library.service import LibraryService

    return LibraryService(repo)


def get_book_copy_service(repo=Depends(get_book_copy_repository)):
    from app.services.library.service import BookCopyService

    return BookCopyService(repo)


def get_book_issue_service(repo=Depends(get_book_issue_repository)):
    from app.services.library.service import BookIssueService

    return BookIssueService(repo)


def get_reservation_service(repo=Depends(get_reservation_repository)):
    from app.services.library.service import ReservationService

    return ReservationService(repo)


def get_fine_service(repo=Depends(get_fine_repository)):
    from app.services.library.service import FineService

    return FineService(repo)


def get_hostel_service(repo=Depends(get_hostel_repository)):
    return HostelService(repo)


def get_hostel_entity_service(repo=Depends(get_hostel_entity_repository)):
    from app.services.hostel.service import RoomService

    return RoomService(repo)


def get_room_service(repo=Depends(get_room_repository)):
    from app.services.hostel.service import RoomService

    return RoomService(repo)


def get_bed_service(repo=Depends(get_bed_repository)):
    from app.services.hostel.service import BedService

    return BedService(repo)


def get_hostel_allocation_service(repo=Depends(get_hostel_allocation_repository)):
    from app.services.hostel.service import HostelAllocationService

    return HostelAllocationService(repo)


def get_complaint_service(repo=Depends(get_complaint_repository)):
    from app.services.hostel.service import ComplaintService

    return ComplaintService(repo)


def get_visitor_service(repo=Depends(get_visitor_repository)):
    from app.services.hostel.service import VisitorService

    return VisitorService(repo)


def get_transport_service(repo=Depends(get_transport_repository)):
    return TransportService(repo)


def get_transport_entity_service(repo=Depends(get_transport_entity_repository)):
    from app.services.transport.service import TransportService

    return TransportService(repo)


def get_driver_service(repo=Depends(get_driver_repository)):
    from app.services.transport.service import DriverService

    return DriverService(repo)


def get_route_service(repo=Depends(get_route_repository)):
    from app.services.transport.service import RouteService

    return RouteService(repo)


def get_route_stop_service(repo=Depends(get_route_stop_repository)):
    from app.services.transport.service import RouteStopService

    return RouteStopService(repo)


def get_transport_assignment_service(repo=Depends(get_transport_assignment_repository)):
    from app.services.transport.service import TransportAssignmentService

    return TransportAssignmentService(repo)


def get_vehicle_assignment_service(repo=Depends(get_vehicle_assignment_repository)):
    from app.services.transport.service import VehicleAssignmentService

    return VehicleAssignmentService(repo)


def get_teacher_repository(db=Depends(get_db)):
    return MySQLTeacherRepository(db)


def get_teacher_service(repo=Depends(get_teacher_repository)):
    return TeacherService(repo)


def get_notification_service(repo=Depends(get_notification_repository)):
    return NotificationService(repo)


def get_procurement_service(repo=Depends(get_procurement_repository)):
    return ProcurementService(repo)


def get_inventory_service(repo=Depends(get_inventory_repository)):
    return InventoryService(repo)


def get_finance_service(repo=Depends(get_finance_repository)):
    return FinanceService(repo)


def get_audit_service(repo=Depends(get_audit_repository)):
    return AuditService(repo)


def get_academic_service(
    dept_repo=Depends(get_department_repository),
    designation_repo=Depends(get_designation_repository),
    year_repo=Depends(get_academic_year_repository),
    semester_repo=Depends(get_semester_repository),
    course_repo=Depends(get_course_repository),
    subject_repo=Depends(get_subject_repository),
    class_repo=Depends(get_academic_class_repository),
    section_repo=Depends(get_section_repository),
):
    return AcademicService(
        dept_repo,
        designation_repo,
        year_repo,
        semester_repo,
        course_repo,
        subject_repo,
        class_repo,
        section_repo,
    )


def get_auth_service(repo=Depends(get_auth_repository)):
    return AuthService(repo)


def get_helpdesk_ticket_repository(db=Depends(get_db)):
    return MySQLTicketRepository(db)


def get_helpdesk_ticket_attachment_repository(db=Depends(get_db)):
    return MySQLTicketAttachmentRepository(db)


def get_helpdesk_ticket_service(
    ticket_repo=Depends(get_helpdesk_ticket_repository),
    attachment_repo=Depends(get_helpdesk_ticket_attachment_repository),
):
    return TicketService(ticket_repo, attachment_repo)


def get_helpdesk_ticket_attachment_service(
    attachment_repo=Depends(get_helpdesk_ticket_attachment_repository),
):
    return TicketAttachmentService(attachment_repo)
