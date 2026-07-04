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
from app.models.employees import Employee


def query_employee_by_id(sess, emp_id):
    # Use a lightweight core query to avoid triggering ORM relationship
    # loaders (which may hit missing tables like `teachers`).
    from sqlalchemy import text

    row = sess.execute(text("SELECT id, first_name FROM employees WHERE id = :id"), {"id": emp_id}).first()
    if row is None:
        return None
    class Simple:
        pass

    obj = Simple()
    obj.id = row[0]
    obj.first_name = row[1]
    return obj


def run_integration_tests():
    client = TestClient(app)

    base = "/api/v1/employees"

    # CREATE
    import datetime
    suffix = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    payload = {"employee_code": f"INT-E-{suffix}", "first_name": "Integration", "last_name": "Tester", "email": f"int.employee+{suffix}@example.com", "phone": f"1234{suffix[-6:]}", "status": "Active"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    emp_id = created['id']

    # VERIFY IN DB
    sess = SessionLocal()
    try:
        row = query_employee_by_id(sess, emp_id)
        print('DB row after create:', bool(row), getattr(row, 'first_name', None))
        assert row is not None

        # LIST
        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        # GET by id
        resp = client.get(f"{base}/{emp_id}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        # UPDATE
        resp = client.put(f"{base}/{emp_id}", json={"first_name": "IntegrationUpdated"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200
        # verify update with a fresh session
        sess2 = SessionLocal()
        try:
            row2 = query_employee_by_id(sess2, emp_id)
            print('DB name after update (fresh session):', getattr(row2, 'first_name', None))
            assert row2.first_name == 'IntegrationUpdated'
        finally:
            sess2.close()

        # DELETE
        resp = client.delete(f"{base}/{emp_id}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_employee_by_id(sess3, emp_id)
            print('DB row after delete (fresh session):', row_after)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    time.sleep(0.5)
    run_integration_tests()
