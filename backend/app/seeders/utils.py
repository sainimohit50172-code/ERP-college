from typing import Iterable
from sqlalchemy import text
from sqlalchemy.engine import Engine
from app.db.database import engine, SessionLocal


def ensure_column_exists(engine: Engine, table: str, column: str, sql_type: str, default: str = "0") -> None:
    inspector = None
    try:
        from sqlalchemy import inspect

        inspector = inspect(engine)
    except Exception:
        return

    cols = [c["name"] for c in inspector.get_columns(table)] if table in inspector.get_table_names() else []
    if column in cols:
        return

    # Add column (SQLite and MySQL compatible simple ALTER)
    with engine.connect() as conn:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {sql_type} NOT NULL DEFAULT {default}"))
        conn.commit()


def mark_demo(session, table: str, record_id: int) -> None:
    session.execute(text(f"UPDATE {table} SET is_demo=1 WHERE id=:id"), {"id": record_id})
    session.commit()


def get_session():
    return SessionLocal()
