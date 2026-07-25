from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    print('DATABASE=', conn.execute(text('SELECT DATABASE()')).scalar())
    tables = [row[0] for row in conn.execute(text("SHOW TABLES LIKE 'assessment_grade_setups'"))]
    print('TABLES=', tables)
    try:
        count = conn.execute(text('SELECT COUNT(*) FROM assessment_grade_setups')).scalar()
        print('COUNT=', count)
    except Exception as exc:
        print('COUNT ERROR', type(exc).__name__, exc)
