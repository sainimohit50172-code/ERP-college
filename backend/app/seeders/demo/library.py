"""Seed 1000 library items, copies, issues and fines."""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.library.models import LibraryItem, BookCopy, BookIssue, Fine
from app.models.students.models import Student

TARGET = 1000


def seed() -> None:
    ensure_column_exists(engine, "library_items", "is_demo", "BOOLEAN", default="1")
    ensure_column_exists(engine, "book_copies", "is_demo", "BOOLEAN", default="1")
    ensure_column_exists(engine, "book_issues", "is_demo", "BOOLEAN", default="1")

    session = get_session()
    try:
        students = session.query(Student).all()
        if not students:
            raise RuntimeError("No students found.")

        created = 0
        for i in range(TARGET):
            isbn = f"ISBN-{i:06d}"
            item = session.query(LibraryItem).filter(LibraryItem.isbn == isbn).first()
            if not item:
                item = LibraryItem(isbn=isbn, title=f"Demo Book {i+1}", author="Author Demo", publisher="Demo Pub", total_copies=2, available_copies=2)
                setattr(item, "is_demo", 1)
                session.add(item)
                session.flush()
                # add copies
                for cno in range(2):
                    copy = BookCopy(item_id=item.id, copy_no=str(cno + 1), barcode=f"BC-{i:06d}-{cno}")
                    setattr(copy, "is_demo", 1)
                    session.add(copy)
                session.flush()
                created += 1

        # create some issues for first 200 items
        items = session.query(LibraryItem).limit(200).all()
        for idx, it in enumerate(items):
            copies = session.query(BookCopy).filter(BookCopy.item_id == it.id).all()
            if not copies:
                continue
            borrower = students[idx % len(students)]
            issue = BookIssue(copy_id=copies[0].id, borrower_type="Student", borrower_id=borrower.id, issued_on=date.today() - timedelta(days=10), due_on=date.today() + timedelta(days=20), status="Issued")
            setattr(issue, "is_demo", 1)
            session.add(issue)

        session.commit()
        print(f"Library items seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(LibraryItem).count()
        demo = session.query(LibraryItem).filter(getattr(LibraryItem, "is_demo") == 1).count() if hasattr(LibraryItem, "is_demo") else 0
        return {"total_library_items": total, "demo_library_items": demo}
    finally:
        session.close()
