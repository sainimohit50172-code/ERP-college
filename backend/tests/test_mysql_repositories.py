from app.repositories.mysql import (
    MySQLAdmissionRepository,
    MySQLAttendanceRepository,
    MySQLAuditRepository,
    MySQLAuthRepository,
    MySQLEmployeeRepository,
    MySQLExaminationRepository,
    MySQLFeeRepository,
    MySQLFinanceRepository,
    MySQLHostelRepository,
    MySQLInventoryRepository,
    MySQLLibraryRepository,
    MySQLNotificationRepository,
    MySQLProcurementRepository,
    MySQLStudentRepository,
    MySQLTransportRepository,
)


def test_mysql_repositories_are_importable_and_instantiable():
    session = object()

    repos = [
        MySQLAuthRepository(session),
        MySQLStudentRepository(session),
        MySQLAdmissionRepository(session),
        MySQLEmployeeRepository(session),
        MySQLAttendanceRepository(session),
        MySQLFeeRepository(session),
        MySQLExaminationRepository(session),
        MySQLLibraryRepository(session),
        MySQLHostelRepository(session),
        MySQLTransportRepository(session),
        MySQLFinanceRepository(session),
        MySQLProcurementRepository(session),
        MySQLInventoryRepository(session),
        MySQLNotificationRepository(session),
        MySQLAuditRepository(session),
    ]

    assert len(repos) == 15
    assert all(repo.session is session for repo in repos)
