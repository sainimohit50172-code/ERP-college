import os
from sqlalchemy import BigInteger, create_engine, inspect, text
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
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    try:
        with engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT name, sql FROM sqlite_master WHERE type='table' AND sql LIKE '%BIGINT NOT NULL%' AND sql LIKE '%PRIMARY KEY%'"
                )
            ).fetchall()
            if rows:
                logger.warning(
                    "Detected incompatible SQLite schema in %s; removing the old database file and recreating it.",
                    db_path,
                )
                try:
                    engine.dispose()
                    os.remove(db_path)
                except OSError as exc:
                    logger.warning(
                        "Detected incompatible SQLite schema in %s but could not remove file: %s. Continuing with current database.",
                        db_path,
                        exc,
                    )
    except OperationalError:
        pass
    finally:
        engine.dispose()


def _ensure_coe_preference_settings_schema() -> None:
    if not str(engine.url).startswith("sqlite"):
        return
    try:
        with engine.connect() as conn:
            table_info = conn.execute(text("PRAGMA table_info(coe_exam_form_preference_settings)")).fetchall()
            has_exam_calendar_mode = any(column[1] == "exam_calendar_mode" for column in table_info)
            if not has_exam_calendar_mode:
                logger.warning("Adding missing exam_calendar_mode column to coe_exam_form_preference_settings")
                conn.execute(text("ALTER TABLE coe_exam_form_preference_settings ADD COLUMN exam_calendar_mode VARCHAR(32) NOT NULL DEFAULT 'Draft'"))
                conn.commit()
    except OperationalError as exc:
        logger.warning("Unable to ensure the COE preference settings schema: %s", exc)


def _ensure_dmc_student_app_schema() -> None:
    try:
        inspector = inspect(engine)
        if "dmc_student_app" not in inspector.get_table_names():
            return
        column_names = [column["name"] for column in inspector.get_columns("dmc_student_app")]
        if "generation_type" not in column_names:
            logger.warning("Adding missing generation_type column to dmc_student_app")
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE dmc_student_app ADD COLUMN generation_type VARCHAR(32) NOT NULL DEFAULT 'Sequence'"))
                conn.commit()
    except OperationalError as exc:
        logger.warning("Unable to ensure the DMC student app schema: %s", exc)
    except Exception as exc:
        logger.warning("Error checking DMC student app schema: %s", exc)


def _ensure_user_schema() -> None:
    if not str(engine.url).startswith("sqlite"):
        return
    try:
        inspector = inspect(engine)
        if "users" not in inspector.get_table_names():
            return
        column_names = [column["name"] for column in inspector.get_columns("users")]
        with engine.connect() as conn:
            if "mobile_number" not in column_names:
                logger.warning("Adding missing mobile_number column to users")
                conn.execute(text("ALTER TABLE users ADD COLUMN mobile_number VARCHAR(20)"))
            if "is_mobile_verified" not in column_names:
                logger.warning("Adding missing is_mobile_verified column to users")
                conn.execute(text("ALTER TABLE users ADD COLUMN is_mobile_verified BOOLEAN NOT NULL DEFAULT 0"))
            conn.commit()
    except OperationalError as exc:
        logger.warning("Unable to ensure the users schema: %s", exc)
    except Exception as exc:
        logger.warning("Error checking users schema: %s", exc)


def _ensure_transport_route_schema() -> None:
    if not str(engine.url).startswith("sqlite"):
        return
    try:
        inspector = inspect(engine)
        if "routes" not in inspector.get_table_names():
            return
        column_names = [column["name"] for column in inspector.get_columns("routes")]
        if "status" not in column_names:
            logger.warning("Adding missing status column to routes")
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE routes ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Active'"))
                conn.commit()
    except OperationalError as exc:
        logger.warning("Unable to ensure the transport route schema: %s", exc)
    except Exception as exc:
        logger.warning("Error checking transport route schema: %s", exc)


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
from sqlalchemy import event


# Ensure SQLite enforces foreign key constraints on every connection
if str(engine.url).startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_con, connection_record):
        try:
            dbapi_con.execute("PRAGMA foreign_keys=ON")
        except Exception:
            pass

    # Also set PRAGMA on an immediate connection so external checks see it enabled now.
    try:
        with engine.connect() as _conn:
            _conn.execute(text("PRAGMA foreign_keys=ON"))
            _conn.commit()
    except Exception:
        pass

# Ensure the schema exists before any repository uses the database.
try:
    import app.models  # noqa: F401
except ImportError:
    pass
Base.metadata.create_all(engine)
_ensure_dmc_student_app_schema()
_ensure_coe_preference_settings_schema()
_ensure_user_schema()
_ensure_transport_route_schema()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
