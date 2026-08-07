#!/usr/bin/env python
from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import Base, SessionLocal, engine
from app.models.academic.models import (
    AcademicClass,
    AcademicYear,
    AssessmentConfig,
    AssessmentGroup,
    AssessmentGroupItem,
    AssessmentGradeSetup,
    AttendanceMarksConfig,
    AttendanceMarksSetup,
    Course,
    Department,
    Designation,
    Section,
    Semester,
    Subject,
)
from app.models.admissions.models import Admission
from app.models.auth.models import Role, User, UserRole
from app.models.certificates.models import Certificate
from app.models.exam_calendar.models import ExamCalendar
from app.models.exam_fee_setup.admit_card_preferences import CoeAdmitCardPreferences
from app.models.exam_fee_setup.dmc_number_setup import DmcNumberSetup
from app.models.exam_fee_setup.dmc_student_app import DmcStudentApp, DmcStudentAppGlobalSetting
from app.models.exam_fee_setup.exam_bundle import CoeManageBundle
from app.models.exam_fee_setup.exam_shift import CoeExamShift
from app.models.exam_fee_setup.fee_head import CoeFeeHead
from app.models.exam_fee_setup.receipt_configuration import CoeReceiptConfiguration
from app.models.exam_form_preferences.headers_footers import ExamFormHeaderFooter
from app.models.exam_form_preferences.models import ExamFormPreference
from app.models.exam_form_preferences.settings_models import CoeExamFormPreferenceSetting
from app.models.employees.models import (
    Employee,
    LeaveRequest,
    LeaveType,
    PayrollEntry,
    PayrollRun,
)
from app.models.examinations.models import Exam, ExamResult
from app.models.finance.models import (
    Account,
    FeeCategory,
    FeeCollection,
    FeeStructure,
    JournalEntry,
    JournalLine,
    LedgerAccount,
    LedgerEntry,
    Payment,
    Receipt,
    Transaction,
)
from app.models.hostel.models import Bed, Hostel, HostelAllocation, Room
from app.models.inventory.models import AssetRegister, InventoryItem, Stock, StockMovement, Warehouse
from app.models.library.models import BookCopy, BookIssue, Fine, LibraryItem, Reservation
from app.models.procurement.models import (
    GoodsReceipt,
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseRequest,
    Supplier,
)
from app.models.students.models import Guardian, Student, StudentAssignment
from app.models.teacher import Teacher
from app.models.transport.models import Driver, Route, RouteStop, TransportAssignment, Vehicle


def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


def get_scalar(session: Session, model: Any, **filters: Any) -> Any:
    return session.scalar(select(model).filter_by(**filters))


def get_or_create(session: Session, model: Any, defaults: dict[str, Any] | None = None, **filters: Any) -> Any:
    instance = get_scalar(session, model, **filters)
    if instance is not None:
        return instance
    params = {**filters}
    if defaults:
        params.update(defaults)
    instance = model(**params)
    session.add(instance)
    session.flush()
    return instance


def ensure_user(session: Session, email: str, username: str, full_name: str, password: str, is_superuser: bool = False) -> User:
    user = session.scalar(select(User).where(User.email == email))
    if user is not None:
        return user

    user = User(
        email=email,
        username=username,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        is_active=True,
        is_superuser=is_superuser,
    )
    session.add(user)
    session.flush()
    return user


def ensure_role(session: Session, name: str, description: str = "") -> Role:
    return get_or_create(session, Role, name=name, defaults={"description": description, "is_builtin": True})


def assign_role(session: Session, user: User, role: Role) -> None:
    existing = session.scalar(select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role.id))
    if existing is None:
        session.add(UserRole(user_id=user.id, role_id=role.id))


def seed_auth(session: Session) -> User:
    admin_role = ensure_role(session, "Admin", "Full access administrator")
    staff_role = ensure_role(session, "Staff", "ERP staff users")
    admin_user = ensure_user(
        session,
        email="admin@collegeerp.local",
        username="admin",
        full_name="System Administrator",
        password="Admin@123",
        is_superuser=True,
    )
    assign_role(session, admin_user, admin_role)
    session.commit()
    return admin_user


def seed_academics(session: Session) -> tuple[list[Department], list[Course], list[Subject], list[AcademicClass], list[Section]]:
    departments = [
        get_or_create(session, Department, name="Science & Computer Studies", code="SCI", defaults={"description": "Science and computer science programs."}),
        get_or_create(session, Department, name="Commerce & Business", code="COM", defaults={"description": "Commerce, business and management programs."}),
        get_or_create(session, Department, name="Education & Humanities", code="EDU", defaults={"description": "Education, arts, and humanities programs."}),
    ]

    designations = [
        get_or_create(session, Designation, title="Principal", defaults={"description": "Head of institution."}),
        get_or_create(session, Designation, title="Professor", defaults={"description": "Senior teaching faculty."}),
        get_or_create(session, Designation, title="Assistant Professor", defaults={"description": "Academic teaching staff."}),
        get_or_create(session, Designation, title="Accountant", defaults={"description": "Finance and accounts manager."}),
    ]

    academic_years = [
        get_or_create(session, AcademicYear, name="2024-2025", defaults={"start_date": date(2024, 6, 1), "end_date": date(2025, 5, 31), "is_active": True}),
        get_or_create(session, AcademicYear, name="2023-2024", defaults={"start_date": date(2023, 6, 1), "end_date": date(2024, 5, 31), "is_active": False}),
    ]

    semesters = []
    for academic_year in academic_years:
        for semester_name, start_offset, end_offset in [
            ("Semester 1", 0, 120),
            ("Semester 2", 121, 240),
        ]:
            semesters.append(
                get_or_create(
                    session,
                    Semester,
                    academic_year_id=academic_year.id,
                    name=semester_name,
                    defaults={
                        "start_date": academic_year.start_date + timedelta(days=start_offset),
                        "end_date": academic_year.start_date + timedelta(days=end_offset),
                    },
                )
            )

    courses = [
        get_or_create(session, Course, code="BCA", name="Bachelor of Computer Applications", department_id=departments[0].id, defaults={"credits": 128}),
        get_or_create(session, Course, code="BSC-CS", name="B.Sc. Computer Science", department_id=departments[0].id, defaults={"credits": 120}),
        get_or_create(session, Course, code="BCOM", name="B.Com. (Commerce)", department_id=departments[1].id, defaults={"credits": 120}),
        get_or_create(session, Course, code="BBA", name="BBA (Business Administration)", department_id=departments[1].id, defaults={"credits": 120}),
        get_or_create(session, Course, code="BEd", name="B.Ed. (Education)", department_id=departments[2].id, defaults={"credits": 100}),
        get_or_create(session, Course, code="BA-ECO", name="B.A. Economics", department_id=departments[2].id, defaults={"credits": 110}),
    ]

    subjects = []
    subject_map = {
        "BCA": [
            ("BCA-DS", "Data Structures"),
            ("BCA-WD", "Web Development"),
            ("BCA-OS", "Operating Systems"),
        ],
        "BSC-CS": [
            ("CSC-DM", "Discrete Mathematics"),
            ("CSC-OOP", "Object Oriented Programming"),
            ("CSC-DB", "Database Systems"),
        ],
        "BCOM": [
            ("COM-FA", "Financial Accounting"),
            ("COM-BL", "Business Law"),
            ("COM-TX", "Taxation"),
        ],
        "BBA": [
            ("BBA-MKT", "Marketing Management"),
            ("BBA-HRM", "Human Resource Management"),
            ("BBA-BA", "Business Analytics"),
        ],
        "BEd": [
            ("EDU-PED", "Pedagogy"),
            ("EDU-PSY", "Educational Psychology"),
            ("EDU-CUR", "Curriculum Development"),
        ],
        "BA-ECO": [
            ("ECO-MIC", "Microeconomics"),
            ("ECO-MAC", "Macroeconomics"),
            ("ECO-PSY", "Political Science"),
        ],
    }
    for course in courses:
        for code, name in subject_map.get(course.code, []):
            subjects.append(
                get_or_create(
                    session,
                    Subject,
                    code=code,
                    defaults={"name": name, "course_id": course.id, "credits": 4},
                )
            )

    academic_classes = [
        get_or_create(session, AcademicClass, name="BCA I", defaults={"course_id": courses[0].id, "year_id": academic_years[0].id}),
        get_or_create(session, AcademicClass, name="BCA II", defaults={"course_id": courses[0].id, "year_id": academic_years[0].id}),
        get_or_create(session, AcademicClass, name="B.Sc. CS I", defaults={"course_id": courses[1].id, "year_id": academic_years[0].id}),
        get_or_create(session, AcademicClass, name="B.Com. I", defaults={"course_id": courses[2].id, "year_id": academic_years[0].id}),
        get_or_create(session, AcademicClass, name="BBA I", defaults={"course_id": courses[3].id, "year_id": academic_years[0].id}),
        get_or_create(session, AcademicClass, name="B.Ed. I", defaults={"course_id": courses[4].id, "year_id": academic_years[0].id}),
    ]

    sections = []
    for academic_class in academic_classes:
        for section_name in ["A", "B"]:
            sections.append(
                get_or_create(
                    session,
                    Section,
                    class_id=academic_class.id,
                    name=section_name,
                    defaults={"capacity": 30},
                )
            )

    session.commit()
    return departments, courses, subjects, academic_classes, sections


def seed_leave_types(session: Session) -> list[LeaveType]:
    leave_types = [
        ("annual", "Annual Leave", "Planned annual leave."),
        ("sick", "Sick Leave", "Leave for short-term illness."),
        ("casual", "Casual Leave", "Personal leave for urgent needs."),
        ("maternity", "Maternity Leave", "Leave for maternity-related needs."),
    ]
    results = []
    for code, name, description in leave_types:
        results.append(get_or_create(session, LeaveType, code=code, defaults={"name": name, "description": description}))
    session.commit()
    return results


def seed_admin_staff(session: Session, admin_user: User) -> tuple[list[Employee], list[Teacher]]:
    staff_user = ensure_user(
        session,
        email="accounts@collegeerp.local",
        username="accounts",
        full_name="Accounts Manager",
        password="Staff@123",
        is_superuser=False,
    )
    staff_role = ensure_role(session, "Staff", "ERP staff users")
    assign_role(session, staff_user, staff_role)

    employees = [
        get_or_create(
            session,
            Employee,
            employee_no="EMP-100",
            defaults={
                "user_id": staff_user.id,
                "first_name": "Rohit",
                "last_name": "Sharma",
                "designation_id": get_or_create(session, Designation, title="Accountant").id,
                "department_id": get_or_create(session, Department, name="Commerce & Business").id,
                "date_of_joining": date(2022, 8, 1),
                "status": "Active",
                "email": "accounts@collegeerp.local",
                "phone": "+91-9876501234",
            },
        ),
    ]
    teachers = []
    teacher_users = [
        ("priya.verma@collegeerp.local", "priya.verma", "Priya Verma"),
        ("arjun.rao@collegeerp.local", "arjun.rao", "Arjun Rao"),
        ("sneha.kumar@collegeerp.local", "sneha.kumar", "Sneha Kumar"),
    ]
    for index, (email, username, full_name) in enumerate(teacher_users, start=1):
        user = ensure_user(session, email=email, username=username, full_name=full_name, password="Teacher@123")
        assign_role(session, user, staff_role)
        employee = get_or_create(
            session,
            Employee,
            employee_no=f"EMP-10{index}",
            defaults={
                "user_id": user.id,
                "first_name": full_name.split()[0],
                "last_name": full_name.split()[-1],
                "designation_id": get_or_create(session, Designation, title="Assistant Professor").id,
                "department_id": get_or_create(session, Department, name="Science & Computer Studies").id,
                "date_of_joining": date(2023, 7, index + 1),
                "status": "Active",
                "email": email,
                "phone": f"+91-90123456{index:02d}",
            },
        )
        teacher = get_or_create(session, Teacher, employee_id=employee.id, defaults={"teacher_code": f"TEA-00{index}"})
        teachers.append(teacher)
        employees.append(employee)

    session.commit()
    return employees, teachers


def seed_students(session: Session, academic_classes: list[AcademicClass], sections: list[Section]) -> list[Student]:
    student_info = [
        ("Aarav", "Patel", "M", "BCA I", "A"),
        ("Ishaan", "Mehta", "M", "BCA I", "B"),
        ("Neha", "Singh", "F", "BCA II", "A"),
        ("Riya", "Desai", "F", "BCA II", "B"),
        ("Kabir", "Sharma", "M", "B.Sc. CS I", "A"),
        ("Ananya", "Kumar", "F", "B.Sc. CS I", "B"),
        ("Sahil", "Gupta", "M", "B.Com. I", "A"),
        ("Priya", "Rao", "F", "B.Com. I", "B"),
        ("Tanvi", "Khan", "F", "BBA I", "A"),
        ("Karan", "Patel", "M", "BBA I", "B"),
        ("Meera", "Joshi", "F", "B.Ed. I", "A"),
        ("Arjun", "Nair", "M", "B.Ed. I", "B"),
    ]

    section_map = {(section.class_id, section.name): section for section in sections}
    class_map = {academic_class.name: academic_class for academic_class in academic_classes}
    students = []

    for index, (first_name, last_name, gender, class_name, section_name) in enumerate(student_info, start=1):
        academic_class = class_map[class_name]
        section = section_map[(academic_class.id, section_name)]
        admission = get_or_create(
            session,
            Admission,
            applicant_name=f"{first_name} {last_name}",
            email=f"{first_name.lower()}.{last_name.lower()}@student.collegeerp.local",
            phone=f"+91-99000{1000 + index}",
            defaults={
                "applied_on": datetime.utcnow(),
                "status": "Converted",
                "notes": "Converted from demo admission", 
            },
        )
        student = get_or_create(
            session,
            Student,
            admission_no=str(admission.id),
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "dob": date(2005, (index % 12) + 1, ((index * 2) % 28) + 1),
                "gender": gender,
                "class_id": academic_class.id,
                "section_id": section.id,
                "enrollment_date": date(2024, 6, 15),
                "status": "Active",
                "contact": {"email": f"{first_name.lower()}.{last_name.lower()}@student.collegeerp.local", "phone": f"+91-99000{2000 + index}"},
                "meta": {"rollNumber": f"{1000 + index}", "course": academic_class.course.name},
            },
        )
        students.append(student)
        guardian = get_or_create(
            session,
            Guardian,
            student_id=student.id,
            name=f"{last_name} {"" if gender == 'F' else ''}".strip(),
            defaults={
                "relation_type": "Parent",
                "contact": {"phone": f"+91-88000{3000 + index}"},
                "primary_contact": True,
            },
        )
        session.add(guardian)

    session.commit()
    return students


def seed_student_details(session: Session, students: list[Student]) -> None:
    for student in students:
        for offset, status in enumerate(["Present", "Present", "Late", "Absent", "Present"], start=0):
            record_date = date(2025, 1, 10 + offset)
            get_or_create(
                session,
                AttendanceRecord,
                student_id=student.id,
                date=record_date,
                defaults={"status": status, "recorded_by": None},
            )

        get_or_create(
            session,
            Certificate,
            student_id=student.id,
            certificate_type="Enrollment Certificate",
            defaults={"issue_date": date(2025, 1, 20), "status": "Issued", "remarks": "Issued for exam registration."},
        )

        get_or_create(
            session,
            StudentAssignment,
            student_id=student.id,
            title="Semester Project",
            defaults={"description": "Complete the semester project with a demo case study.", "due_date": date(2025, 2, 28), "submitted": offset % 2 == 0, "grade": "A"},
        )

    session.commit()


def seed_exam_calendar(session: Session) -> None:
    get_or_create(
        session,
        ExamCalendar,
        exam_name="Midterm Examination 2025",
        defaults={
            "academic_session": "2024-2025",
            "exam_type": "Midterm",
            "exam_category": "Internal",
            "start_date": date(2025, 2, 1),
            "end_date": date(2025, 2, 12),
            "description": "Midterm exams for first half of academic year.",
            "status": "Scheduled",
            "created_by": "system",
            "created_date": date(2025, 1, 1),
        },
    )
    get_or_create(
        session,
        ExamCalendar,
        exam_name="Final Examination 2025",
        defaults={
            "academic_session": "2024-2025",
            "exam_type": "Final",
            "exam_category": "External",
            "start_date": date(2025, 4, 10),
            "end_date": date(2025, 4, 25),
            "description": "Final exams for graduating and continuing students.",
            "status": "Upcoming",
            "created_by": "system",
            "created_date": date(2025, 1, 10),
        },
    )
    session.commit()


def seed_exams(session: Session, students: list[Student], subjects: list[Subject]) -> None:
    exams = [
        get_or_create(session, Exam, name="BCA Semester 1 Midterm", code="EX-BCAM1", term="Semester 1", start_date=date(2025, 2, 1), end_date=date(2025, 2, 8)),
        get_or_create(session, Exam, name="B.Sc. CS Semester 1 Final", code="EX-CSF1", term="Semester 1", start_date=date(2025, 4, 10), end_date=date(2025, 4, 18)),
        get_or_create(session, Exam, name="B.Com Semester 1 Exam", code="EX-COM1", term="Semester 1", start_date=date(2025, 2, 5), end_date=date(2025, 2, 12)),
    ]
    subject_groups = {
        "BCA": [subject for subject in subjects if subject.course.code == "BCA"],
        "BSC-CS": [subject for subject in subjects if subject.course.code == "BSC-CS"],
        "BCOM": [subject for subject in subjects if subject.course.code == "BCOM"],
    }

    for student in students:
        course_code = student.academic_class.course.code if student.academic_class and student.academic_class.course else None
        exam = next((e for e in exams if course_code and course_code in e.name), exams[0])
        available_subjects = subject_groups.get(course_code, subjects[:2])
        for subject in available_subjects[:2]:
            get_or_create(
                session,
                ExamResult,
                exam_id=exam.id,
                student_id=student.id,
                subject_id=subject.id,
                defaults={
                    "marks": Decimal("78.50") if student.gender == "F" else Decimal("72.00"),
                    "grade": "A" if student.gender == "F" else "B+",
                    "remarks": "Satisfactory performance.",
                },
            )
    session.commit()


def seed_hostel_and_transport(session: Session, students: list[Student], employees: list[Employee]) -> None:
    hostel = get_or_create(session, Hostel, name="Crescent Hostel", defaults={"address": "Near Main Gate, College Campus", "capacity": 120})
    rooms = []
    for index in range(1, 5):
        rooms.append(
            get_or_create(
                session,
                Room,
                hostel_id=hostel.id,
                room_no=f"H-{index:02d}",
                defaults={"capacity": 2, "building": "Block A", "floor": "" if index <= 2 else "1", "has_projector": False, "has_lab": False, "has_ac": index % 2 == 0, "status": "Active", "gender": "Coed"},
            )
        )
    beds = []
    for room in rooms:
        for bed_number in range(1, (room.capacity or 2) + 1):
            beds.append(
                get_or_create(
                    session,
                    Bed,
                    room_id=room.id,
                    bed_no=f"{room.room_no}-{bed_number}",
                    defaults={"occupied": False},
                )
            )

    for student, bed in zip(students[:4], beds[:4]):
        allocation = get_or_create(
            session,
            HostelAllocation,
            student_id=student.id,
            bed_id=bed.id,
            defaults={"start_date": date(2025, 1, 15), "end_date": None, "status": "Active"},
        )
        bed.occupied = True
        session.add(bed)
        session.add(allocation)

    routes = []
    for index, (name, start_point, end_point) in enumerate([
        ("Campus Loop", "North Gate", "Main Campus"),
        ("City Connector", "Downtown", "College Campus"),
    ], start=1):
        route = get_or_create(session, Route, name=name, defaults={"start_point": start_point, "end_point": end_point, "distance_km": 12 if index == 1 else 18, "status": "Active"})
        routes.append(route)
        for stop_index, stop_name in enumerate([start_point, "Central Junction", end_point], start=1):
            get_or_create(session, RouteStop, route_id=route.id, stop_name=stop_name, defaults={"sequence_no": stop_index})

    vehicles = []
    for index, reg_no in enumerate(["KA-01-AA-1001", "KA-01-AA-1002"], start=1):
        vehicles.append(
            get_or_create(session, Vehicle, registration_no=reg_no, defaults={"vehicle_type": "Bus", "capacity": 40, "status": "Active"})
        )

    for driver_employee, vehicle, route in zip(employees[:2], vehicles, routes):
        driver = get_or_create(session, Driver, employee_id=driver_employee.id, defaults={"license_no": f"DL-12345{driver_employee.id}", "status": "Active"})
        get_or_create(session, TransportAssignment, vehicle_id=vehicle.id, route_id=route.id, assigned_to=driver_employee.id, defaults={"assigned_on": datetime.utcnow(), "status": "Assigned"})

    session.commit()


def seed_library(session: Session, students: list[Student]) -> None:
    items = []
    for code, title, author, publisher in [
        ("ISBN-001", "Modern Database Systems", "Ramakrishnan", "Pearson"),
        ("ISBN-002", "Applied Physics", "Harris", "McGraw Hill"),
        ("ISBN-003", "Principles of Accounting", "Tulsian", "McGraw Hill"),
        ("ISBN-004", "Introduction to Psychology", "Morgan", "Oxford"),
    ]:
        item = get_or_create(session, LibraryItem, isbn=code, defaults={"title": title, "author": author, "publisher": publisher, "total_copies": 3, "available_copies": 3})
        items.append(item)
        for copy_index in range(1, 4):
            get_or_create(session, BookCopy, item_id=item.id, copy_no=f"{code}-C{copy_index}", defaults={"barcode": f"{code}-{copy_index}", "status": "Available", "location": "Main Library"})

    for student, item in zip(students[:3], items[:3]):
        copy = session.scalar(select(BookCopy).where(BookCopy.item_id == item.id, BookCopy.status == "Available"))
        if copy:
            copy.status = "OnLoan"
            session.add(copy)
            get_or_create(session, BookIssue, copy_id=copy.id, borrower_type="Student", borrower_id=student.id, defaults={"due_on": date(2025, 2, 28), "status": "Issued", "fine_amount": Decimal("0.00")})
            item.available_copies = max(0, item.available_copies - 1)
            session.add(item)

    get_or_create(session, Reservation, item_id=items[0].id, borrower_type="Student", borrower_id=students[3].id, defaults={"status": "Active", "expires_at": datetime(2025, 3, 1)})
    get_or_create(session, Reservation, item_id=items[1].id, borrower_type="Student", borrower_id=students[4].id, defaults={"status": "Active", "expires_at": datetime(2025, 3, 10)})
    get_or_create(session, Fine, borrower_type="Student", borrower_id=students[2].id, defaults={"amount": Decimal("150.00"), "paid": False})
    session.commit()


def seed_finance(session: Session, academic_year: AcademicYear, students: list[Student]) -> None:
    categories = []
    for name, description in [
        ("Tuition Fee", "Regular semester tuition"),
        ("Exam Fee", "Examination processing fee"),
        ("Hostel Fee", "Hostel accommodation charges"),
        ("Library Fee", "Library membership and late fines"),
    ]:
        categories.append(get_or_create(session, FeeCategory, name=name, defaults={"description": description}))

    for category in categories:
        get_or_create(session, FeeStructure, category_id=category.id, academic_year_id=academic_year.id, defaults={"amount": Decimal("12000.00") if category.name == "Tuition Fee" else Decimal("1500.00")})

    accounts = []
    for account_no, account_name, account_type, balance in [
        ("AC-100", "Cash Account", "Cash", Decimal("250000.00")),
        ("AC-200", "Bank Account", "Bank", Decimal("420000.00")),
        ("AC-300", "Accounts Receivable", "Receivable", Decimal("78000.00")),
    ]:
        accounts.append(get_or_create(session, Account, account_no=account_no, defaults={"account_name": account_name, "type": account_type, "balance": balance}))

    for student in students[:6]:
        category = categories[0]
        get_or_create(session, FeeCollection, student_id=student.id, category_id=category.id, defaults={"amount": Decimal("12000.00"), "payment_mode": "UPI", "receipt_no": f"RCPT-{student.id:04d}", "status": "Collected"})
        get_or_create(session, Payment, student_id=student.id, defaults={"amount": Decimal("12000.00"), "status": "Success", "gateway_reference": f"PAY-{student.id:05d}", "paid_on": datetime.utcnow()})
        get_or_create(session, Receipt, student_id=student.id, receipt_no=f"R-{student.id:05d}", defaults={"amount": Decimal("12000.00"), "status": "Completed"})

    journal_entry = get_or_create(session, JournalEntry, entry_no="JE-001", defaults={"description": "Demo tuition collection", "entry_date": datetime.utcnow()})
    debit_account = accounts[0]
    credit_account = accounts[2]
    get_or_create(session, JournalLine, journal_entry_id=journal_entry.id, account_id=debit_account.id, defaults={"debit": Decimal("72000.00"), "credit": Decimal("0.00")})
    get_or_create(session, JournalLine, journal_entry_id=journal_entry.id, account_id=credit_account.id, defaults={"debit": Decimal("0.00"), "credit": Decimal("72000.00")})
    get_or_create(session, Transaction, account_id=debit_account.id, defaults={"amount": Decimal("72000.00"), "direction": "Credit", "description": "Student fee receipts"})
    session.commit()


def seed_inventory_and_procurement(session: Session) -> None:
    warehouses = [
        get_or_create(session, Warehouse, name="Main Warehouse", defaults={"location": "Block D"}),
        get_or_create(session, Warehouse, name="Electronics Store", defaults={"location": "Block E"}),
    ]
    suppliers = [
        get_or_create(session, Supplier, name="Campus Supplies Pvt Ltd", defaults={"contact_person": "Nidhi Jain", "phone": "+91-9876501111", "email": "support@campussupplies.local"}),
        get_or_create(session, Supplier, name="Library Essentials", defaults={"contact_person": "Anil Mehta", "phone": "+91-9876502222", "email": "orders@libraryessentials.local"}),
    ]

    items = []
    for sku, name, warehouse in [
        ("INV-1001", "Projector", warehouses[0]),
        ("INV-1002", "Lab Microscope", warehouses[0]),
        ("INV-2001", "Printer Cartridge", warehouses[1]),
    ]:
        item = get_or_create(session, InventoryItem, sku=sku, defaults={"warehouse_id": warehouse.id, "name": name, "description": f"Demo asset {name}"})
        items.append(item)
        stock = get_or_create(session, Stock, item_id=item.id, defaults={"quantity": 5, "reorder_level": 2})
        get_or_create(session, StockMovement, stock_id=stock.id, defaults={"movement_type": "In", "quantity": 5, "reason": "Initial stock"})

    for supplier in suppliers:
        request = get_or_create(session, PurchaseRequest, request_no=f"PR-{supplier.id:04d}", defaults={"department_id": None, "requested_by": None, "status": "Pending"})
        order = get_or_create(session, PurchaseOrder, supplier_id=supplier.id, order_no=f"PO-{supplier.id:04d}", defaults={"order_date": datetime.utcnow(), "total_amount": Decimal("12500.00"), "status": "Approved"})
        get_or_create(session, PurchaseOrderLine, purchase_order_id=order.id, defaults={"item_name": "New lab equipment", "quantity": 2, "unit_price": Decimal("6250.00")})
        get_or_create(session, GoodsReceipt, purchase_order_id=order.id, defaults={"status": "Received"})

    session.commit()


def seed_coe_and_exam_preferences(session: Session, admin_user: User) -> None:
    get_or_create(session, CoeExamShift, shift_name="Morning", defaults={"start_time": "09:00", "end_time": "12:00", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, CoeExamShift, shift_name="Afternoon", defaults={"start_time": "14:00", "end_time": "17:00", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, CoeManageBundle, bundle_name="Standard Bundle", defaults={"bundle_code": "BND-ST", "bundle_type": "Standard", "description": "Standard exam bundle.", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, CoeMaskingNumberSetup, series_name="DMC-2025", defaults={"prefix": "DMC", "starting_number": 1000, "ending_number": 1999, "current_number": 1001, "digit_length": 6, "description": "DMC numbering series", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, CoeReceiptConfiguration, defaults={"prefix": "RCPT", "receipt_number": 101, "suffix": "2025", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, CoeAdmitCardPreferences, defaults={"fee_check": True, "attendance_check": True, "library_check": True, "feedback_check": False, "created_by": admin_user.id})
    get_or_create(session, DmcStudentApp, name="Default DMC App", defaults={"prefix": "DMC", "suffix": "2025", "start_number": 1000, "end_number": 9999, "current_number": 1000, "generation_type": "Sequence", "status": "Active", "created_by": admin_user.id})
    get_or_create(session, DmcStudentAppGlobalSetting, defaults={"enabled": True, "created_by": admin_user.id})
    get_or_create(session, ExamFormPreference, academic_session="2024-2025", institute="Central College", course="BCA", program="BCA", semester="Semester 1", exam_type="Midterm", defaults={"form_opening_date": date(2025, 1, 5), "form_closing_date": date(2025, 1, 25), "late_fee_date": date(2025, 1, 30), "late_fee_amount": Decimal("250.00"), "allow_improvement": True, "status": "Active", "created_by": "system", "created_date": date(2025, 1, 1)})
    get_or_create(session, ExamFormHeaderFooter, header_name="Default Header", defaults={"header_html": "<h1>Central College</h1>", "footer_html": "<p>Generated by College ERP</p>", "institute": "Central College", "exam_type": "Midterm", "status": "Active", "created_date": date(2025, 1, 1)})
    get_or_create(session, CoeExamFormPreferenceSetting, defaults={"student_awake_status": True, "auto_approve": False, "personal_details_check": True, "exam_calendar_mode": "Draft", "created_by": admin_user.id})
    session.commit()


def run_seed() -> None:
    print("Starting demo seed process...")
    create_tables()
    session = SessionLocal()
    try:
        admin_user = seed_auth(session)
        departments, courses, subjects, academic_classes, sections = seed_academics(session)
        seed_leave_types(session)
        employees, teachers = seed_admin_staff(session, admin_user)
        students = seed_students(session, academic_classes, sections)
        seed_student_details(session, students)
        seed_exam_calendar(session)
        seed_exams(session, students, subjects)
        seed_hostel_and_transport(session, students, employees)
        seed_library(session, students)
        active_year = session.scalar(select(AcademicYear).where(AcademicYear.is_active == True))
        if active_year is None:
            active_year = session.scalar(select(AcademicYear).where(AcademicYear.name == "2024-2025"))
        if active_year:
            seed_finance(session, active_year, students)
        seed_inventory_and_procurement(session)
        seed_coe_and_exam_preferences(session, admin_user)
        print("Demo seed completed successfully.")
    except Exception as exc:
        session.rollback()
        print("Demo seed failed:", exc)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    run_seed()
