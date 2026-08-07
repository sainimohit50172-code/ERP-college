"""Seed master academic data: colleges (as departments), courses, academic years, semesters, sections."""
from datetime import date
from typing import Optional

from app.db.database import engine
from app.models.academic.models import Department, AcademicYear, Semester, Course
from app.seeders.utils import get_session


COLLEGES = [
    "ROORKEE COLLEGE OF SMART COMPUTING",
    "ROORKEE COLLEGE OF ENGINEERING",
    "ROORKEE COLLEGE OF AGRICULTURE SCIENCE",
    "ROORKEE COLLEGE OF BUSINESS STUDIES",
    "ROORKEE COLLEGE OF ALLIED HEALTH SCIENCE",
]


def _update_if_missing(instance, **fields) -> bool:
    """Update attributes on instance only if they are None or falsy.

    Returns True if any field was updated.
    """
    updated = False
    for k, v in fields.items():
        if getattr(instance, k, None) in (None, "") and v is not None:
            setattr(instance, k, v)
            updated = True
    return updated


def seed(colleges: Optional[list[str]] = None) -> dict:
    """Idempotent seeding of academic master data.

    Returns a report dict with counts: reused, inserted, updated, skipped, final_counts.
    """
    colleges = colleges or COLLEGES
    session = get_session()
    report = {
        "departments_reused": 0,
        "departments_inserted": 0,
        "departments_updated": 0,
        "academic_years_reused": 0,
        "academic_years_inserted": 0,
        "academic_years_updated": 0,
        "semesters_reused": 0,
        "semesters_inserted": 0,
        "semesters_updated": 0,
        "courses_reused": 0,
        "courses_inserted": 0,
        "courses_updated": 0,
    }
    try:
        # Departments (colleges)
        for name in colleges:
            dept = session.query(Department).filter(Department.name == name).first()
            if dept:
                # ensure description exists
                if _update_if_missing(dept, description=f"Master college record for {name}"):
                    report["departments_updated"] += 1
                report["departments_reused"] += 1
            else:
                dept = Department(name=name, description=f"Master college record for {name}")
                session.add(dept)
                session.flush()
                report["departments_inserted"] += 1

        # Academic year
        ay = session.query(AcademicYear).filter(AcademicYear.name == "2025-2026").first()
        if ay:
            if _update_if_missing(ay, start_date=date(2025, 7, 1), end_date=date(2026, 6, 30), is_active=True):
                report["academic_years_updated"] += 1
            report["academic_years_reused"] += 1
        else:
            ay = AcademicYear(name="2025-2026", start_date=date(2025, 7, 1), end_date=date(2026, 6, 30), is_active=True)
            session.add(ay)
            session.flush()
            report["academic_years_inserted"] += 1

        # Semesters
        sem1 = session.query(Semester).filter(Semester.academic_year_id == ay.id, Semester.name == "Semester 1").first()
        if sem1:
            if _update_if_missing(sem1, start_date=date(2025, 7, 1), end_date=date(2025, 12, 31)):
                report["semesters_updated"] += 1
            report["semesters_reused"] += 1
        else:
            sem1 = Semester(academic_year_id=ay.id, name="Semester 1", start_date=date(2025, 7, 1), end_date=date(2025, 12, 31))
            session.add(sem1)
            report["semesters_inserted"] += 1

        sem2 = session.query(Semester).filter(Semester.academic_year_id == ay.id, Semester.name == "Semester 2").first()
        if sem2:
            if _update_if_missing(sem2, start_date=date(2026, 1, 1), end_date=date(2026, 6, 30)):
                report["semesters_updated"] += 1
            report["semesters_reused"] += 1
        else:
            sem2 = Semester(academic_year_id=ay.id, name="Semester 2", start_date=date(2026, 1, 1), end_date=date(2026, 6, 30))
            session.add(sem2)
            report["semesters_inserted"] += 1

        session.flush()

        # Ensure at least one sample course per department (idempotent)
        departments = session.query(Department).all()
        for dept in departments:
            course_code = f"{dept.name.split()[0][:4].upper()}-BSC"
            existing = session.query(Course).filter(Course.code == course_code).first()
            if existing:
                # update missing fields only
                updated = _update_if_missing(existing, name=f"Bachelor of Science - {dept.name.split()[0]}", department_id=dept.id)
                if updated:
                    report["courses_updated"] += 1
                report["courses_reused"] += 1
            else:
                c = Course(code=course_code, name=f"Bachelor of Science - {dept.name.split()[0]}", department_id=dept.id)
                session.add(c)
                session.flush()
                report["courses_inserted"] += 1

        session.commit()

        # Final counts
        final_counts = {
            "departments": session.query(Department).count(),
            "academic_years": session.query(AcademicYear).count(),
            "semesters": session.query(Semester).count(),
            "courses": session.query(Course).count(),
        }
        report["final_counts"] = final_counts
        return report
    finally:
        session.close()
