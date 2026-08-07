"""Seed 500 students distributed equally across five colleges."""
from __future__ import annotations

from datetime import date
from math import floor

from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.students.models import Student, Guardian
from app.models.academic.models import Department, AcademicClass, Section, AcademicYear

SEED_COUNT = 500


def seed() -> None:
    ensure_column_exists(engine, "students", "is_demo", "BOOLEAN", default="1")

    session = get_session()
    try:
        # Departments represent colleges
        colleges = session.query(Department).all()
        if not colleges or len(colleges) < 5:
            raise RuntimeError("Expecting 5 colleges in departments. Seed master data first.")

        # Ensure academic year and classes exist
        ay = session.query(AcademicYear).filter(AcademicYear.is_active == True).first()
        if not ay:
            ay = session.query(AcademicYear).first()
        if not ay:
            raise RuntimeError("No academic year found. Seed master data.")

        # Create one class per college if none
        classes = session.query(AcademicClass).all()
        if not classes:
            classes = []
            for idx, c in enumerate(session.query(Department).all()):
                course_name = f"Course for {c.name.split()[0]}"
                ac = AcademicClass(name=course_name, course_id=None, year_id=ay.id)
                session.add(ac)
                session.flush()
                # create sections
                sec = Section(class_id=ac.id, name="A", capacity=100)
                sec2 = Section(class_id=ac.id, name="B", capacity=100)
                session.add_all([sec, sec2])
                classes.append(ac)

        sections = session.query(Section).all()
        if not sections:
            raise RuntimeError("No sections available after setup.")

        per_college = SEED_COUNT // len(colleges)
        created = 0
        student_idx = 0
        for col in colleges:
            for i in range(per_college):
                student_idx += 1
                admission_no = f"AD{student_idx:05d}"
                exists = session.query(Student).filter(Student.admission_no == admission_no).first()
                if exists:
                    continue
                # assign class and section round-robin
                ac = session.query(AcademicClass).filter(AcademicClass.course_id == None).first()
                sec = sections[student_idx % len(sections)]
                s = Student(admission_no=admission_no, first_name=f"Stud{student_idx}", last_name=col.name.split()[0], dob=date(2004, 1, 1), class_id=ac.id if ac else None, section_id=sec.id, enrollment_date=date(2023, 7, 1))
                setattr(s, "is_demo", 1)
                session.add(s)
                session.flush()
                # add guardian
                g = Guardian(student_id=s.id, name=f"Guardian{student_idx}", relation_type="Parent", primary_contact=True)
                session.add(g)
                created += 1

        session.commit()
        print(f"Students seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(Student).count()
        demo = session.query(Student).filter(getattr(Student, "is_demo") == 1).count() if hasattr(Student, "is_demo") else 0
        return {"total_students": total, "demo_students": demo}
    finally:
        session.close()
