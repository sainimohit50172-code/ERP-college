from app.core.config import get_settings
from sqlalchemy import create_engine, text

settings = get_settings()
engine = create_engine(settings.database_url, future=True)
conn = engine.connect()
rows = conn.execute(text('SHOW COLUMNS FROM `rooms`')).fetchall()
print(rows)
conn.close()
