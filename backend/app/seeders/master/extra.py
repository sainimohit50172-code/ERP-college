"""Seed additional master data: designations, fee heads, hostels, routes, subjects."""
from __future__ import annotations

from datetime import datetime
from app.seeders.utils import get_session
from app.models.academic.models import Designation, Course, Subject
from app.models.exam_fee_setup.fee_head import CoeFeeHead
from app.models.hostel.models import Hostel
from app.models.transport.models import Route


def seed() -> None:
    session = get_session()
    report = {
        "designations_reused": 0,
        "designations_inserted": 0,
        "fee_heads_reused": 0,
        "fee_heads_inserted": 0,
        "fee_heads_updated": 0,
        "hostels_reused": 0,
        "hostels_inserted": 0,
        "hostels_updated": 0,
        "routes_reused": 0,
        "routes_inserted": 0,
        "routes_updated": 0,
        "subjects_reused": 0,
        "subjects_inserted": 0,
    }

    def _update_if_missing(instance, **fields):
        updated = False
        for k, v in fields.items():
            if getattr(instance, k, None) in (None, "") and v is not None:
                setattr(instance, k, v)
                updated = True
        return updated

    try:
        # Designations
        titles = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Senior Lecturer"]
        for t in titles:
            des = session.query(Designation).filter(Designation.title == t).first()
            if des:
                report["designations_reused"] += 1
            else:
                session.add(Designation(title=t))
                report["designations_inserted"] += 1

        # Fee heads
        fee_heads = [
            ("Tuition Fee", "TUITION", "Tuition"),
            ("Development Fee", "DEVEL", "Development"),
            ("Library Fee", "LIB", "Library"),
        ]
        for name, code, category in fee_heads:
            exists = session.query(CoeFeeHead).filter(CoeFeeHead.fee_head_code == code).first()
            if exists:
                # update only missing/default fields
                updated = _update_if_missing(exists, fee_head_name=name, receipt_head=name, fee_category=category, display_order=0, amount_type="Fixed", is_refundable=False, tax_applicable=False, status="Active")
                if updated:
                    report["fee_heads_updated"] += 1
                report["fee_heads_reused"] += 1
            else:
                fh = CoeFeeHead(fee_head_name=name, fee_head_code=code, receipt_head=name, fee_category=category, display_order=0, amount_type="Fixed", is_refundable=False, tax_applicable=False, status="Active")
                session.add(fh)
                report["fee_heads_inserted"] += 1

        # Hostels
        hostels = ["Hostel A", "Hostel B"]
        for h in hostels:
            hs = session.query(Hostel).filter(Hostel.name == h).first()
            if hs:
                # no extra fields to update by default, but keep count
                report["hostels_reused"] += 1
            else:
                session.add(Hostel(name=h))
                report["hostels_inserted"] += 1

        # Routes
        routes = [("Route 1", "Campus", "City"), ("Route 2", "North Gate", "South Gate")]
        for name, start, end in routes:
            r = session.query(Route).filter(Route.name == name).first()
            if r:
                updated = _update_if_missing(r, start_point=start, end_point=end)
                if updated:
                    report["routes_updated"] += 1
                report["routes_reused"] += 1
            else:
                session.add(Route(name=name, start_point=start, end_point=end))
                report["routes_inserted"] += 1

        # Subjects - master definitions only: add a few per course
        courses = session.query(Course).all()
        for course in courses:
            for i in range(1, 6):
                code = f"{course.code}-S{i}"
                name = f"{course.name} Subject {i}"
                subj = session.query(Subject).filter(Subject.code == code).first()
                if subj:
                    report["subjects_reused"] += 1
                else:
                    s = Subject(code=code, name=name, course_id=course.id)
                    session.add(s)
                    report["subjects_inserted"] += 1

        session.commit()
        print("Master extras seeded")
        return report
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        d = session.query(Designation).count()
        fh = session.query(CoeFeeHead).count()
        h = session.query(Hostel).count()
        r = session.query(Route).count()
        subj = session.query(Subject).count()
        return {"designations": d, "fee_heads": fh, "hostels": h, "routes": r, "subjects": subj}
    finally:
        session.close()
