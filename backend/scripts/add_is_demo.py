#!/usr/bin/env python3
"""Add `is_demo` BOOLEAN NOT NULL DEFAULT 0 to operational tables only.

Master tables (permanent) will be skipped.
"""
from __future__ import annotations

from app.seeders.utils import ensure_column_exists, engine
from sqlalchemy import inspect
from app.core.config import get_settings


MASTER_TABLES = {
    "departments",
    "academic_years",
    "courses",
    "semesters",
    "sections",
    "subjects",
    "fee_heads",
    "library_categories",
    "hostel_blocks",
    "transport_routes",
    "designations",
}


def main():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    added = []
    skipped = []
    for t in tables:
        if t in MASTER_TABLES:
            skipped.append(t)
            continue
        cols = [c["name"] for c in inspector.get_columns(t)]
        if "is_demo" in cols:
            continue
        try:
            ensure_column_exists(engine, t, "is_demo", "BOOLEAN", default="0")
            added.append(t)
        except Exception as exc:
            print(f"Failed to add is_demo to {t}: {exc}")

    print("is_demo added to tables:", added)
    print("Skipped master tables:", skipped)


if __name__ == "__main__":
    main()
