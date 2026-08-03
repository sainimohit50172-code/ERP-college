import sys
import os

# Ensure backend package is importable during tests
ROOT = os.path.dirname(__file__)
BACKEND_PATH = os.path.join(ROOT, "backend")
if BACKEND_PATH not in sys.path:
    sys.path.insert(0, BACKEND_PATH)

# Ensure tests run against local SQLite and that models create tables on startup
os.environ.setdefault("USE_SQLITE", "1")
os.environ.setdefault("APP_ENV", "development")
os.environ.setdefault("SQLITE_URL", "sqlite:///./test_college_erp.db")

print(f"[conftest] added to PYTHONPATH: {BACKEND_PATH}; USE_SQLITE={os.environ.get('USE_SQLITE')}; SQLITE_URL={os.environ.get('SQLITE_URL')}")

# Ensure SQLAlchemy tables exist for tests (idempotent)
try:
    from app.db.database import Base, engine
    import app.models
    from sqlalchemy import text
    import pytest

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("[conftest] reset DB tables via Base.metadata.drop_all/create_all")

    @pytest.fixture(autouse=True)
    def clean_exam_calendar_table():
        try:
            with engine.begin() as conn:
                conn.execute(text("DELETE FROM exam_calendars"))
        except Exception as _exc:
            print(f"[conftest] warning: could not clean exam_calendars table: {_exc}")
        yield
except Exception as _exc:
    print(f"[conftest] warning: could not ensure DB tables: {_exc}")
