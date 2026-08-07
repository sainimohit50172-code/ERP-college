#!/usr/bin/env python3
"""Perform pre-checks before seeding: foreign keys, tables, columns, is_demo, master data, migrations."""
from __future__ import annotations

import os
from pathlib import Path
from sqlalchemy import inspect, text

from app.db.database import engine, Base
from app.core.config import get_settings


def check_foreign_keys_sqlite(conn) -> bool:
    r = conn.execute(text("PRAGMA foreign_keys;"))
    val = r.scalar()
    return bool(val)


def check_foreign_keys_mysql(conn) -> bool:
    r = conn.execute(text("SELECT @@FOREIGN_KEY_CHECKS"))
    val = r.scalar()
    return bool(val)


def main():
    settings = get_settings()
    inspector = inspect(engine)
    db_tables = set(inspector.get_table_names())
    expected_tables = set(Base.metadata.tables.keys())

    missing_tables = expected_tables - db_tables
    if missing_tables:
        print("MISSING_TABLES:", missing_tables)
    else:
        print("All expected tables present")

    # foreign key checks
    with engine.connect() as conn:
        if str(engine.url).startswith("sqlite"):
            fk_ok = check_foreign_keys_sqlite(conn)
        else:
            fk_ok = check_foreign_keys_mysql(conn)
        print("FOREIGN_KEYS_ENABLED:", fk_ok)

        # is_demo column on operational tables (skip master tables)
        MASTER_TABLES = {
            "departments",
            "academic_years",
            "courses",
            "semesters",
            "sections",
            "subjects",
            "coe_fee_heads",
            "library_categories",
            "hostels",
            "routes",
            "designations",
        }

        missing_is_demo = []
        for tbl in expected_tables:
            if tbl in MASTER_TABLES:
                continue
            try:
                cols = [c["name"] for c in inspector.get_columns(tbl)]
            except Exception:
                cols = []
            if "is_demo" not in cols:
                missing_is_demo.append(tbl)
        if missing_is_demo:
            print("MISSING_is_demo_COLUMN on:", missing_is_demo)
        else:
            print("is_demo present on all expected tables")

        # basic master data checks
        md_checks = {}
        if "departments" in db_tables:
            r = conn.execute(text("SELECT COUNT(1) FROM departments"))
            md_checks["departments_count"] = int(r.scalar() or 0)
        if "academic_years" in db_tables:
            r = conn.execute(text("SELECT COUNT(1) FROM academic_years"))
            md_checks["academic_years_count"] = int(r.scalar() or 0)
        print("MASTER_DATA_COUNTS:", md_checks)

        # check alembic versions
        # Use alembic to determine head revision instead of filesystem sort
        latest_revision = None
        try:
            import subprocess

            proc = subprocess.run(["python", "-m", "alembic", "heads"], cwd=Path(__file__).resolve().parents[1], capture_output=True, text=True)
            out = proc.stdout.strip()
            if out:
                # take first token in output lines as revision
                latest_revision = out.splitlines()[0].split()[0]
        except Exception:
            latest_revision = None

        if "alembic_version" in db_tables:
            try:
                r = conn.execute(text("SELECT version_num FROM alembic_version LIMIT 1"))
                current = r.scalar()
            except Exception:
                current = None
        else:
            current = None

        print("ALEMBIC_LATEST_REVISION:", latest_revision)
        print("ALEMBIC_DB_REVISION:", current)

        # summary status
        problems = []
        if missing_tables:
            problems.append("missing_tables")
        if not fk_ok:
            problems.append("foreign_keys_disabled")
        if missing_is_demo:
            problems.append("missing_is_demo_columns")
        if latest_revision and current and latest_revision != str(current):
            problems.append("pending_migrations")

        if problems:
            print("PRECHECK_FAILED:", problems)
            raise SystemExit(2)
        else:
            print("PRECHECK_OK: All pre-checks passed")


if __name__ == "__main__":
    main()
