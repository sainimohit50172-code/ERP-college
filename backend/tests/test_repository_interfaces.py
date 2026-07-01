from abc import ABC

from app.repositories.interfaces import (
    AdmissionRepository,
    AttendanceRepository,
    AuditRepository,
    AuthRepository,
    EmployeeRepository,
    ExaminationRepository,
    FeeRepository,
    FinanceRepository,
    HostelRepository,
    InventoryRepository,
    LibraryRepository,
    NotificationRepository,
    ProcurementRepository,
    StudentRepository,
    TransportRepository,
)


def test_repository_interfaces_are_importable_and_abstract():
    assert issubclass(AuthRepository, ABC)
    assert issubclass(StudentRepository, ABC)
    assert issubclass(AdmissionRepository, ABC)
    assert issubclass(EmployeeRepository, ABC)
    assert issubclass(AttendanceRepository, ABC)
    assert issubclass(FeeRepository, ABC)
    assert issubclass(ExaminationRepository, ABC)
    assert issubclass(LibraryRepository, ABC)
    assert issubclass(HostelRepository, ABC)
    assert issubclass(TransportRepository, ABC)
    assert issubclass(FinanceRepository, ABC)
    assert issubclass(ProcurementRepository, ABC)
    assert issubclass(InventoryRepository, ABC)
    assert issubclass(NotificationRepository, ABC)
    assert issubclass(AuditRepository, ABC)
