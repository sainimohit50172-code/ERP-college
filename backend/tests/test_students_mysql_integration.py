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
from app.models.students import Student


def query_student_by_id(sess, student_id):
    return sess.query(Student).filter(Student.id == student_id).first()


def run_integration_tests():
    client = TestClient(app)

    base = "/api/v1/students"

    # CREATE
    import datetime
    suffix = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    payload = {
        "admission_number": f"INT-S-{suffix}",
        "first_name": "Integration",
        "last_name": "Tester",
        "email": f"int.student+{suffix}@example.com",
        "phone": f"1234{suffix[-6:]}",
        "status": "Active",
    }
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    student_id = created['id']

    # VERIFY IN DB
    sess = SessionLocal()
    try:
        row = query_student_by_id(sess, student_id)
        print('DB row after create:', bool(row), getattr(row, 'first_name', None))
        assert row is not None

        # LIST
        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        # GET by id
        resp = client.get(f"{base}/{student_id}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        # UPDATE
        resp = client.put(f"{base}/{student_id}", json={"first_name": "IntegrationUpdated"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200
        # verify update with a fresh session to observe committed changes
        sess2 = SessionLocal()
        try:
            row2 = query_student_by_id(sess2, student_id)
            print('DB name after update (fresh session):', getattr(row2, 'first_name', None))
            assert row2.first_name == 'IntegrationUpdated'
        finally:
            sess2.close()

        # DELETE
        resp = client.delete(f"{base}/{student_id}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_student_by_id(sess3, student_id)
            print('DB row after delete (fresh session):', row_after)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    # wait briefly in case DB just became available
    time.sleep(0.5)
    run_integration_tests()
