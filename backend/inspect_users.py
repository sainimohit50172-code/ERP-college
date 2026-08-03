import sqlite3
import os

path = os.path.abspath('backend/college_erp.db')
print('DB', path, os.path.exists(path))
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute('SELECT name FROM sqlite_master WHERE type="table" ORDER BY name;')
print('tables', cur.fetchall())
try:
    cur.execute('SELECT id,email,username,hashed_password,is_active,is_superuser,meta FROM users LIMIT 20')
    print('users', cur.fetchall())
except Exception as exc:
    print('user query error', exc)
finally:
    conn.close()
