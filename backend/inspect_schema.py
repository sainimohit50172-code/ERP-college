from app.core.config import get_settings
from sqlalchemy import create_engine, text

settings = get_settings()
print('DB URL', settings.database_url)
engine = create_engine(settings.database_url, future=True)
conn = engine.connect()
for table in ['rooms', 'employees', 'teachers', 'students', 'departments']:
    try:
        rows = conn.execute(text(f'SHOW COLUMNS FROM `{table}`'))
        cols = [row[0] for row in rows]
        print(table, cols)
    except Exception as e:
        print(table, 'ERROR', e)
conn.close()
