import os
import sys
sys.path.insert(0, os.getcwd())
from app.db.database import engine, _sqlite_db_path
from sqlalchemy import text
print('engine.url', engine.url)
print('sqlite_path', _sqlite_db_path(str(engine.url)))
with engine.connect() as conn:
    rows = conn.execute(text('PRAGMA table_info("miscellaneous_remarks")')).fetchall()
    for row in rows:
        print(row)
