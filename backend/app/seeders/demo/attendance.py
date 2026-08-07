"""Seed attendance records covering six months (~50k records)."""
from __future__ import annotations

from datetime import date, timedelta
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.attendance.models import AttendanceRecord
from app.models.students.models import Student

TARGET = 50000


def seed() -> None:
    ensure_column_exists(engine, "attendance_records", "is_demo", "BOOLEAN", default="1")
    session = get_session()
    try:
        students = session.query(Student).all()
        if not students:
            raise RuntimeError("No students found. Seed students first.")

        start = date.today().replace(day=1) - timedelta(days=180)
        days = 180
        statuses = ["Present", "Absent", "Excused", "Late"]
        created = 0
        idx = 0
        # iterate dates and students until target
        for d in (start + timedelta(days=i) for i in range(days)):
            for s in students:
                if created >= TARGET:
                    break
                # idempotent by unique constraint? No unique, so check by student/date existence
                exists = session.query(AttendanceRecord).filter(AttendanceRecord.student_id == s.id, AttendanceRecord.date == d).first()
                if exists:
                    continue
                ar = AttendanceRecord(student_id=s.id, date=d, status=statuses[(s.id + idx) % len(statuses)])
                setattr(ar, "is_demo", 1)
                session.add(ar)
                created += 1
            if created >= TARGET:
                break

        session.commit()
        print(f"Attendance records seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(AttendanceRecord).count()
        demo = session.query(AttendanceRecord).filter(getattr(AttendanceRecord, "is_demo") == 1).count() if hasattr(AttendanceRecord, "is_demo") else 0
        return {"total_attendance": total, "demo_attendance": demo}
    finally:
        session.close()
