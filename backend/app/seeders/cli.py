"""Simple seeder CLI for development and demo data management."""
import argparse
import sys
from app.seeders.master import academic as academic_master
from app.seeders.utils import get_session, ensure_column_exists, engine


def seed_master() -> None:
    print("Seeding master academic data...")
    academic_master.seed()
    print("Master data seeded.")


def cleanup_demo() -> None:
    print("Cleaning up demo records (is_demo=1)...")
    # Find tables that have is_demo column and delete records
    from sqlalchemy import inspect, text

    inspector = inspect(engine)
    tables = inspector.get_table_names()
    session = get_session()
    try:
        for table in tables:
            cols = [c["name"] for c in inspector.get_columns(table)]
            if "is_demo" in cols:
                res = session.execute(text(f"DELETE FROM {table} WHERE is_demo=1"))
                if res.rowcount:
                    print(f"Deleted {res.rowcount} demo rows from {table}")
        session.commit()
    finally:
        session.close()
    print("Cleanup complete.")


def ensure_demo_columns(tables: list[str]):
    for t in tables:
        ensure_column_exists(engine, t, "is_demo", "BOOLEAN", default="0")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="seed")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("master", help="Seed master data")
    sub.add_parser("cleanup-demo", help="Remove demo records (is_demo=1)")
    sub.add_parser("ensure-demo-columns", help="Ensure is_demo column exists on core tables")

    args = parser.parse_args(argv)
    if args.cmd == "master":
        seed_master()
        return 0
    if args.cmd == "cleanup-demo":
        cleanup_demo()
        return 0
    if args.cmd == "ensure-demo-columns":
        ensure_demo_columns(["students", "teachers", "employees", "subjects", "library_books", "attendance"])  # best-effort
        return 0

    parser.print_help()
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
