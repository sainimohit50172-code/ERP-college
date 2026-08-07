"""Seed ~150 subjects and assign to courses, semesters, teachers."""
from __future__ import annotations

from typing import List
import random

from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.academic.models import Subject, Course, Semester
from app.models.teachers.models import Teacher

SEED_COUNT = 150


def seed() -> None:
    ensure_column_exists(engine, "subjects", "is_demo", "BOOLEAN", default="1")

    session = get_session()
    try:
        courses = session.query(Course).all()
        semesters = session.query(Semester).all()
        teachers = session.query(Teacher).all()
        if not courses or not semesters or not teachers:
            raise RuntimeError("Missing courses/semesters/teachers. Ensure master and teacher seeders ran.")

        subjects_created = 0
        for i in range(SEED_COUNT):
            subj_code = f"SUBJ-{1000 + i}"
            exists = session.query(Subject).filter(Subject.code == subj_code).first()
            course = courses[i % len(courses)]
            sem = semesters[i % len(semesters)]
            teacher = teachers[i % len(teachers)]
            if exists:
                continue
            s = Subject(code=subj_code, name=f"Subject {i+1}", course_id=course.id)
            # store extra association in meta via JSON if needed
            setattr(s, "is_demo", 1)
            session.add(s)
            session.flush()
            # Optionally link teacher via a mapping table; no direct FK in model, so store in subject meta
            s_meta = s.meta or {}
            s_meta.update({"assigned_teacher_id": teacher.id, "semester_id": sem.id})
            s.meta = s_meta
            session.add(s)
            subjects_created += 1

        session.commit()
        print(f"Subjects seeded: {subjects_created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(Subject).count()
        demo = session.query(Subject).filter(getattr(Subject, "is_demo") == 1).count() if hasattr(Subject, "is_demo") else 0
        return {"total_subjects": total, "demo_subjects": demo}
    finally:
        session.close()
