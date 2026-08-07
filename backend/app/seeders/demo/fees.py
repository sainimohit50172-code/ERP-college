"""Seed fee categories, structures and fee collections (~5000)."""
from __future__ import annotations

from decimal import Decimal
from datetime import datetime
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.finance.models import FeeCategory, FeeStructure, FeeCollection
from app.models.students.models import Student

TARGET = 5000


def seed() -> None:
    ensure_column_exists(engine, "fee_collections", "is_demo", "BOOLEAN", default="1")
    session = get_session()
    try:
        # ensure categories
        categories = ["Tuition", "Transport", "Library", "Hostel"]
        existing = {c.name: c for c in session.query(FeeCategory).all()}
        for name in categories:
            if name not in existing:
                fc = FeeCategory(name=name)
                session.add(fc)
                session.flush()
                existing[name] = fc

        students = session.query(Student).all()
        if not students:
            raise RuntimeError("No students found.")

        created = 0
        for i in range(TARGET):
            student = students[i % len(students)]
            cat = list(existing.values())[i % len(existing)]
            exists = session.query(FeeCollection).filter(FeeCollection.student_id == student.id, FeeCollection.category_id == cat.id, FeeCollection.receipt_no == f"RCPT-{i:06d}").first()
            if exists:
                continue
            fc = FeeCollection(student_id=student.id, category_id=cat.id, amount=Decimal("1000.00"), collected_on=datetime.utcnow(), payment_mode="Cash", receipt_no=f"RCPT-{i:06d}", status="Collected")
            setattr(fc, "is_demo", 1)
            session.add(fc)
            created += 1
            if created % 500 == 0:
                session.flush()

        session.commit()
        print(f"Fee transactions seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(FeeCollection).count()
        demo = session.query(FeeCollection).filter(getattr(FeeCollection, "is_demo") == 1).count() if hasattr(FeeCollection, "is_demo") else 0
        return {"total_fee_collections": total, "demo_fee_collections": demo}
    finally:
        session.close()
