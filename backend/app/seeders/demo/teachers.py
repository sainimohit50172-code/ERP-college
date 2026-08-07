"""Seed 35 teachers and supporting employees/designations."""
from __future__ import annotations

from typing import List
import random
from datetime import date

from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.academic.models import Designation, Department
from app.models.employees.models import Employee
from app.models.teachers.models import Teacher

SEED_COUNT = 35


def seed() -> None:
    ensure_column_exists(engine, "employees", "is_demo", "BOOLEAN", default="0")
    ensure_column_exists(engine, "teachers", "is_demo", "BOOLEAN", default="0")

    session = get_session()
    try:
        # Ensure some designations exist
        titles = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Senior Lecturer"]
        existing = {d.title: d for d in session.query(Designation).all()}
        for t in titles:
            if t not in existing:
                d = Designation(title=t)
                session.add(d)
                session.flush()
                existing[t] = d

        departments = session.query(Department).all() or []
        if not departments:
            raise RuntimeError("No departments/colleges found. Seed master data first.")

        teachers_created = 0
        for i in range(SEED_COUNT):
            # create employee
            employee_code = f"EMP-T{1000 + i}"
            emp = session.query(Employee).filter(Employee.employee_no == employee_code).first()
            dept = departments[i % len(departments)]
            if not emp:
                emp = Employee(
                    employee_no=employee_code,
                    first_name=f"Teacher{i+1}",
                    last_name=dept.name.split()[0],
                    designation_id=list(existing.values())[i % len(existing)].id,
                    department_id=dept.id,
                    date_of_joining=date(2020, 1, 1),
                )
                emp.contact = {"email": f"teacher{i+1}@demo.edu", "phone": f"900000{i+1:03d}"}
                # mark demo
                setattr(emp, "is_demo", 1)
                session.add(emp)
                session.flush()

            # create teacher record
            t_code = f"TCHR{2000 + i}"
            t = session.query(Teacher).filter(Teacher.teacher_code == t_code).first()
            if not t:
                t = Teacher(employee_id=emp.id, teacher_code=t_code)
                setattr(t, "is_demo", 1)
                session.add(t)
                session.flush()
                teachers_created += 1

        session.commit()
        print(f"Teachers seeded: {teachers_created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(Teacher).count()
        demo = session.query(Teacher).filter(getattr(Teacher, "is_demo") == 1).count() if hasattr(Teacher, "is_demo") else 0
        return {"total_teachers": total, "demo_teachers": demo}
    finally:
        session.close()
