import os
import traceback
from pathlib import Path

os.chdir(Path(__file__).resolve().parent)

print('CWD', os.getcwd())

try:
    from app.main import app
    from app.core.config import get_settings
    from app.db.database import engine
    settings = get_settings()
    print('ENGINE DIAL', engine.dialect.name)
    print('DB_URL', settings.database_url)
    print('USE_SQLITE', settings.use_sqlite)
    print('APP ROUTE COUNT', len(app.router.routes))
    for i, route in enumerate(app.router.routes[:40]):
        print('ROUTE', i, type(route).__name__, getattr(route, 'path', None), getattr(route, 'name', None), getattr(route, 'methods', None))
    try:
        openapi = app.openapi()
        paths = openapi.get('paths', {})
        print('OPENAPI PATH COUNT', len(paths))
        print('OPENAPI KEYS', list(paths.keys())[:20])
    except Exception as exc:
        print('OPENAPI ERROR', exc)
        traceback.print_exc()
    try:
        with engine.connect() as conn:
            from sqlalchemy import text
            print('DB URL', str(engine.url))
            print('CONNECTION OK')
            try:
                result = conn.execute(text('SELECT DATABASE()'))
                print('CURRENT DB', result.scalar_one())
            except Exception as exc:
                print('CURRENT DB ERROR', exc)
            try:
                result = conn.execute(text('SELECT COUNT(*) FROM exam_calendars'))
                print('EXAM_CALENDARS COUNT', result.scalar_one())
            except Exception as exc:
                print('EXAM_CALENDARS ERROR', exc)
    except Exception as exc:
        print('ENGINE CONNECT ERROR', exc)
        traceback.print_exc()
except Exception as exc:
    print('IMPORT ERROR', exc)
    traceback.print_exc()
