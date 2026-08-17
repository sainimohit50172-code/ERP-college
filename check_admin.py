from sqlalchemy import create_engine, text
import os

db_path = os.path.join(os.getcwd(), 'backend', 'college_erp.db')
engine = create_engine(f'sqlite:///{db_path}')

with engine.connect() as conn:
    result = conn.execute(text('SELECT id, email, username, hashed_password FROM users WHERE username = "admin"'))
    rows = result.fetchall()
    print(f'Found {len(rows)} user(s):')
    for row in rows:
        print(f'  ID: {row[0]}')
        print(f'  Email: {row[1]}')
        print(f'  Username: {row[2]}')
        print(f'  Password hash: {row[3] if row[3] else "None"}')
