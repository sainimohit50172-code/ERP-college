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
from app.models.academic import Department


def query_department_by_id(sess, dept_id):
    return sess.query(Department).filter(Department.id == dept_id).first()


def run_integration_tests():
    client = TestClient(app)

    base = "/api/v1/departments"

    # CREATE
    payload = {"name": "Integration Dept", "code": "INT", "description": "Integration test"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    dept_id = created['id']

    # VERIFY IN DB
    sess = SessionLocal()
    try:
        row = query_department_by_id(sess, dept_id)
        print('DB row after create:', bool(row), getattr(row, 'name', None))
        assert row is not None

        # LIST
        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        # GET by id
        resp = client.get(f"{base}/{dept_id}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        # UPDATE
        resp = client.put(f"{base}/{dept_id}", json={"name": "Integration Dept Updated"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200
        sess.refresh(row)
        print('DB name after update:', row.name)
        assert row.name == 'Integration Dept Updated'

        # DELETE
        resp = client.delete(f"{base}/{dept_id}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        row_after = query_department_by_id(sess, dept_id)
        print('DB row after delete:', row_after)
        assert row_after is None

    finally:
        sess.close()


if __name__ == '__main__':
    # wait briefly in case DB just became available
    time.sleep(0.5)
    run_integration_tests()
