"""
Ensure all SQLAlchemy models are imported and create DB tables.
Run: python backend/ensure_db.py
"""
import traceback

from app.db import database


def main():
    try:
        # Import models to register them with Base
        import app.models  # noqa: F401
    except Exception:
        print('ERROR importing app.models:')
        traceback.print_exc()
        return

    try:
        print('Creating all tables...')
        database.Base.metadata.create_all(bind=database.engine)
        print('Tables created (or already existed).')
    except Exception:
        print('ERROR creating tables:')
        traceback.print_exc()


if __name__ == '__main__':
    main()
