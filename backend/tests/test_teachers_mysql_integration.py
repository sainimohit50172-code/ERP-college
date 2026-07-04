import os
import sys
import time

# Set DB env vars before importing app so engine uses these values
os.environ['MYSQL_HOST'] = '127.0.0.1'
os.environ['MYSQL_PORT'] = '3306'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = 'root'
os.environ['MYSQL_DB'] = 'college_erp'

sys.path.insert(0, "d:/Users/pop/Desktop/new pr/backend")

from fastapi.testclient import TestClient

from app.main import app
from app.db.database import SessionLocal


def query_teacher_by_id(sess, tid):
    from sqlalchemy import text

    row = sess.execute(text("SELECT id, teacher_code, employee_id FROM teachers WHERE id = :id"), {"id": tid}).first()
    if row is None:
        return None
    class Simple:
        pass

    obj = Simple()
    obj.id = row[0]
    obj.teacher_code = row[1]
    obj.employee_id = row[2]
    return obj


def run_integration_tests():
    client = TestClient(app)

    base = "/api/v1/teachers"

    # CREATE prerequisite: Employee
    emp_payload = {"employee_code": f"INT-E-{int(time.time())}", "first_name": "TeacherInt", "last_name": "Tester", "email": f"int.teacher+{int(time.time())}@example.com", "phone": "1234000000", "status": "Active"}
    resp = client.post("/api/v1/employees/", json=emp_payload)
    assert resp.status_code == 201, resp.text
    emp = resp.json()['data']
    emp_id = emp['id']

    # CREATE Teacher
    payload = {"employee_id": emp_id, "teacher_code": f"T-{int(time.time())}"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    tid = created['id']

    # VERIFY IN DB
    sess = SessionLocal()
    try:
        row = query_teacher_by_id(sess, tid)
        print('DB row after create:', bool(row), getattr(row, 'teacher_code', None))
        assert row is not None

        # LIST
        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        # GET by id
        resp = client.get(f"{base}/{tid}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        # UPDATE
        resp = client.put(f"{base}/{tid}", json={"teacher_code": "UPDATED-TEACHER"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200
        # verify update with a fresh session
        sess2 = SessionLocal()
        try:
            row2 = query_teacher_by_id(sess2, tid)
            print('DB code after update (fresh session):', getattr(row2, 'teacher_code', None))
            assert row2.teacher_code == 'UPDATED-TEACHER'
        finally:
            sess2.close()

        # DELETE
        resp = client.delete(f"{base}/{tid}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_teacher_by_id(sess3, tid)
            print('DB row after delete (fresh session):', row_after)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    time.sleep(0.5)
    run_integration_tests()
