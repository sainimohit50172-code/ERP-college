import sqlite3
import os

paths = [
    'backend/college_erp.db',
    'college_erp.db',
    'backend/test_lib_trans.db',
    'test_college_erp.db',
]

for path in paths:
    if os.path.exists(path):
        print('DB:', path)
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        for tbl in ['dmc_student_app', 'coe_dmc_student_app_settings']:
            print(' TABLE', tbl)
            try:
                rows = cur.execute(f'PRAGMA table_info({tbl})').fetchall()
                if rows:
                    for row in rows:
                        print('  ', row)
                else:
                    print('   (none)')
            except Exception as e:
                print('  error', e)
        try:
            rows = cur.execute('SELECT name, sql FROM sqlite_master WHERE type="table" AND name="dmc_student_app"').fetchall()
            for row in rows:
                print('SQL:', row)
        except Exception as e:
            print('SQL error', e)
        conn.close()
        print('---')
