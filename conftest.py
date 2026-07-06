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

print(f"[conftest] added to PYTHONPATH: {BACKEND_PATH}; USE_SQLITE={os.environ.get('USE_SQLITE')}")

# Ensure SQLAlchemy tables exist for tests (idempotent)
try:
    from app.db.database import Base, engine

    Base.metadata.create_all(engine)
    print("[conftest] ensured DB tables created via Base.metadata.create_all")
except Exception as _exc:
    print(f"[conftest] warning: could not ensure DB tables: {_exc}")
