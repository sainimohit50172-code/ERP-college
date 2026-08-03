import sqlite3
import os
from passlib.context import CryptContext

path = os.path.abspath('backend/college_erp.db')
conn = sqlite3.connect(path)
cur = conn.cursor()
cur.execute('SELECT id,email,username,hashed_password,meta FROM users')
rows = cur.fetchall()
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
print('Checking known users for known passwords...')
for row in rows:
    if row[1] in ('admin@example.com', 'admin@collegeerp.local') or row[2] in ('admin', 'admin@collegeerp.local'):
        print('---')
        print('id', row[0], 'email', row[1], 'username', row[2], 'meta', row[4])
        for pw in ['Admin123', 'Admin@123', 'Admin@123456', 'admin123', 'admin@123', 'Admin@1234', 'Admin@12345']:
            try:
                ok = pwd_context.verify(pw, row[3])
            except Exception as exc:
                ok = False
            print(' ', pw, ok)

print('\nBrute forcing a few common variants for all rows:')
for pw in ['Admin123', 'Admin@123', 'Admin@123456', 'Admin1234', 'Admin@1234', 'Admin@12345', 'password', 'Password123', 'Admin123!']:
    matched = [row[1] or row[2] for row in rows if row[3] and pwd_context.verify(pw, row[3])]
    if matched:
        print(pw, 'matches', matched)
conn.close()
