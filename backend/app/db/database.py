import os
from sqlalchemy import BigInteger, create_engine, text
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()

class SQLiteBase:
    __table_args__ = {"sqlite_autoincrement": True}


@compiles(BigInteger, "sqlite")
def _compile_big_integer_sqlite(type_, compiler, **kw):
    return "INTEGER"


Base = declarative_base(cls=SQLiteBase)


def _sqlite_db_path(url: str) -> str | None:
    if not url.startswith("sqlite:///"):
        return None
    path = url[10:]
    if path.startswith("/") and os.name == "nt":
        path = path[1:]
    return os.path.abspath(path)


def _ensure_sqlite_compatible_schema(db_path: str) -> None:
    if not os.path.exists(db_path):
        return
    try:
        with create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False}).connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%BIGINT NOT NULL%' AND sql LIKE '%PRIMARY KEY%'"
                )
            ).fetchall()
            if rows:
                try:
                    os.remove(db_path)
                    logger.warning(
                        "Detected incompatible SQLite schema in %s; removed old database file and will recreate a fresh database.",
                        db_path,
                    )
                except OSError as exc:
                    logger.warning(
                        "Detected incompatible SQLite schema in %s but could not remove file: %s. Continuing with current database.",
                        db_path,
                        exc,
                    )
    except OperationalError:
        pass


def _create_engine(url: str):
    if url.startswith("sqlite:"):
        sqlite_path = _sqlite_db_path(url)
        if sqlite_path:
            _ensure_sqlite_compatible_schema(sqlite_path)

    connect_args = {"check_same_thread": False} if url.startswith("sqlite:") else {}
    engine_kwargs = {
        "pool_pre_ping": True,
        "future": True,
        "connect_args": connect_args,
    }
    if not url.startswith("sqlite:"):
        engine_kwargs.update(
            {
                "pool_size": settings.mysql_pool_size,
                "max_overflow": settings.mysql_max_overflow,
                "pool_recycle": 3600,
            }
        )

    engine = create_engine(url, **engine_kwargs)
    try:
        with engine.connect() as conn:
            pass
    except OperationalError as exc:
        if settings.use_sqlite:
            logger.warning(
                "MySQL unavailable (%s). Falling back to local SQLite database at %s.",
                exc,
                settings.sqlite_url,
            )
            engine = create_engine(settings.sqlite_url, pool_pre_ping=True, future=True, connect_args={"check_same_thread": False})
            with engine.connect() as conn:
                pass
        else:
            logger.error("MySQL unavailable (%s). Startup aborted because USE_SQLITE=false.", exc)
            raise
    return engine

engine = _create_engine(settings.database_url)

if settings.app_env.lower() == "development":
    # Ensure all models are imported so SQLAlchemy metadata includes their tables.
    try:
        import app.models  # noqa: F401
    except ImportError:
        pass
    Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
