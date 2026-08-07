from app.db.database import engine
from sqlalchemy import text

def main():
    with engine.connect() as conn:
        rows = conn.execute(text('SELECT id, code, name, department_id FROM courses')).fetchall()
        print('COURSES:', rows)

if __name__ == '__main__':
    main()
