"""Seed hostels, rooms, beds, and allocations (~250 students)."""
from __future__ import annotations

from datetime import date
from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.hostel.models import Hostel, Room, Bed, HostelAllocation
from app.models.students.models import Student

TARGET_STUDENTS = 250


def seed() -> None:
    ensure_column_exists(engine, "hostels", "is_demo", "BOOLEAN", default="1")
    ensure_column_exists(engine, "rooms", "is_demo", "BOOLEAN", default="1")
    ensure_column_exists(engine, "beds", "is_demo", "BOOLEAN", default="1")
    ensure_column_exists(engine, "hostel_allocations", "is_demo", "BOOLEAN", default="1")

    session = get_session()
    try:
        students = session.query(Student).all()
        if not students:
            raise RuntimeError("No students found.")

        h = session.query(Hostel).filter(Hostel.name == "Demo Hostel").first()
        if not h:
            h = Hostel(name="Demo Hostel", address="Campus North", capacity=500)
            setattr(h, "is_demo", 1)
            session.add(h)
            session.flush()

        # create rooms and beds
        for rno in range(1, 21):
            room_no = f"R{rno:03d}"
            room = session.query(Room).filter(Room.hostel_id == h.id, Room.room_no == room_no).first()
            if not room:
                room = Room(hostel_id=h.id, room_no=room_no, capacity=4, building="Main", floor="1")
                setattr(room, "is_demo", 1)
                session.add(room)
                session.flush()
                for b in range(1, 5):
                    bed = Bed(room_id=room.id, bed_no=str(b), occupied=False)
                    setattr(bed, "is_demo", 1)
                    session.add(bed)
        session.flush()

        beds = session.query(Bed).all()
        created = 0
        for i, student in enumerate(students[:TARGET_STUDENTS]):
            bed = beds[i % len(beds)]
            exists = session.query(HostelAllocation).filter(HostelAllocation.student_id == student.id).first()
            if exists:
                continue
            alloc = HostelAllocation(student_id=student.id, bed_id=bed.id, start_date=date.today())
            setattr(alloc, "is_demo", 1)
            session.add(alloc)
            created += 1

        session.commit()
        print(f"Hostel allocations created: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(HostelAllocation).count()
        demo = session.query(HostelAllocation).filter(getattr(HostelAllocation, "is_demo") == 1).count() if hasattr(HostelAllocation, "is_demo") else 0
        return {"total_hostel_allocations": total, "demo_hostel_allocations": demo}
    finally:
        session.close()
