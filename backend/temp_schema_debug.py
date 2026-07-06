import os
import sys
sys.path.insert(0, os.getcwd())
from sqlalchemy import text
from app.db.database import engine
for tbl in ['designations', 'employees']:
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{tbl}'"))
        print(tbl, result.scalar())
