"""Seed marks records (~10k) linked to exams, students, subjects."""
from __future__ import annotations

from random import randint
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.examinations.models import Exam, ExamResult
from app.models.students.models import Student
from app.models.academic.models import Subject

TARGET = 10000


def seed() -> None:
    ensure_column_exists(engine, "exam_results", "is_demo", "BOOLEAN", default="1")
    session = get_session()
    try:
        students = session.query(Student).all()
        subjects = session.query(Subject).all()
        if not students or not subjects:
            raise RuntimeError("Students or subjects missing.")

        # ensure an exam exists
        exam = session.query(Exam).filter(Exam.name == "Midterm").first()
        if not exam:
            exam = Exam(name="Midterm", code="EX-MID-2025")
            session.add(exam)
            session.flush()

        created = 0
        for i in range(TARGET):
            student = students[i % len(students)]
            subject = subjects[i % len(subjects)]
            exists = session.query(ExamResult).filter(ExamResult.exam_id == exam.id, ExamResult.student_id == student.id, ExamResult.subject_id == subject.id).first()
            if exists:
                continue
            marks = randint(30, 100)
            er = ExamResult(exam_id=exam.id, student_id=student.id, subject_id=subject.id, marks=marks)
            setattr(er, "is_demo", 1)
            session.add(er)
            created += 1
            if created % 1000 == 0:
                session.flush()

        session.commit()
        print(f"Marks seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(ExamResult).count()
        demo = session.query(ExamResult).filter(getattr(ExamResult, "is_demo") == 1).count() if hasattr(ExamResult, "is_demo") else 0
        return {"total_exam_results": total, "demo_exam_results": demo}
    finally:
        session.close()
