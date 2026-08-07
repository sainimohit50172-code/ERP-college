from app.db.database import engine
from sqlalchemy import text

def inspect_table(name: str):
    with engine.connect() as conn:
        try:
            rows = conn.execute(text(f"PRAGMA table_info('{name}')")).fetchall()
            print(f"PRAGMA table_info for {name} ->", rows)
        except Exception as exc:
            print(f"Error inspecting {name}: {exc}")

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print('usage: inspect_table.py <table>')
    else:
        inspect_table(sys.argv[1])
