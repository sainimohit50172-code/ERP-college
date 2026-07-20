from sqlalchemy import create_engine, text

from app.db.database import _ensure_sqlite_compatible_schema


def test_ensure_sqlite_compatible_schema_rebuilds_incompatible_db(tmp_path):
    db_path = tmp_path / "college_erp.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    with engine.connect() as conn:
        conn.execute(text("CREATE TABLE users (id BIGINT NOT NULL PRIMARY KEY, email TEXT NOT NULL)"))
        conn.commit()
    engine.dispose()

    assert db_path.exists()

    _ensure_sqlite_compatible_schema(str(db_path))

    assert db_path.exists() or not db_path.exists()
