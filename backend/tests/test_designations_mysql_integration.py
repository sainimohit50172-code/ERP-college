import os
import sys
import time

os.environ['MYSQL_HOST'] = '127.0.0.1'
os.environ['MYSQL_PORT'] = '3306'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = 'root'
os.environ['MYSQL_DB'] = 'college_erp'

sys.path.insert(0, "d:/Users/pop/Desktop/new pr/backend")

from fastapi.testclient import TestClient
from app.main import app
from app.db.database import SessionLocal


def query_designation_by_id(sess, did):
    from sqlalchemy import text
    row = sess.execute(text("SELECT id, title, created_at FROM designations WHERE id = :id"), {"id": did}).first()
    if row is None:
        return None
    class Simple: pass
    obj = Simple()
    obj.id = row[0]
    obj.title = row[1]
    return obj


def run_integration_tests():
    client = TestClient(app)
    base = "/api/v1/designations"

    payload = {"name": f"Integration Designation {int(time.time())}", "description": "Integration test"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    did = created['id']

    sess = SessionLocal()
    try:
        row = query_designation_by_id(sess, did)
        print('DB row after create:', bool(row), getattr(row, 'title', None))
        assert row is not None

        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        resp = client.get(f"{base}/{did}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        resp = client.put(f"{base}/{did}", json={"name": "Updated Name"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200

        sess2 = SessionLocal()
        try:
            row2 = query_designation_by_id(sess2, did)
            print('DB title after update (fresh session):', getattr(row2, 'title', None))
            assert getattr(row2, 'title', None) == 'Updated Name'
        finally:
            sess2.close()

        resp = client.delete(f"{base}/{did}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_designation_by_id(sess3, did)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    run_integration_tests()
