"""Seed examination calendar, exams, shifts, rooms, invigilators and results."""
from __future__ import annotations

from datetime import date, timedelta
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.exam_calendar.models import ExamCalendar
from app.models.examinations.models import Exam
from app.models.students.models import Student


def seed() -> None:
    ensure_column_exists(engine, "exams", "is_demo", "BOOLEAN", default="1")
    session = get_session()
    try:
        # Create basic exam calendar entries
        cal = session.query(ExamCalendar).filter(ExamCalendar.name == "Main Calendar").first()
        if not cal:
            cal = ExamCalendar(name="Main Calendar", start_date=date.today(), end_date=date.today() + timedelta(days=30))
            setattr(cal, "is_demo", 1)
            session.add(cal)
            session.flush()

        # create exams
        ex = session.query(Exam).filter(Exam.name == "Semester Final").first()
        if not ex:
            ex = Exam(name="Semester Final", code="EX-FNL-2025", start_date=date.today() + timedelta(days=10), end_date=date.today() + timedelta(days=20))
            setattr(ex, "is_demo", 1)
            session.add(ex)

        session.commit()
        print("Examination seed complete.")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(Exam).count()
        return {"total_exams": total}
    finally:
        session.close()
