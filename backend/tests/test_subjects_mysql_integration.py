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


def query_subject_by_id(sess, sid):
    from sqlalchemy import text
    row = sess.execute(text("SELECT id, name, code, course_id FROM subjects WHERE id = :id"), {"id": sid}).first()
    if row is None:
        return None
    class Simple: pass
    obj = Simple()
    obj.id = row[0]
    obj.name = row[1]
    obj.code = row[2]
    obj.course_id = row[3]
    return obj


def run_integration_tests():
    client = TestClient(app)
    base = "/api/v1/subjects"

    payload = {"name": f"Integration Subject {int(time.time())}", "code": f"S-{int(time.time())}"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    sid = created['id']

    sess = SessionLocal()
    try:
        row = query_subject_by_id(sess, sid)
        print('DB row after create:', bool(row), getattr(row, 'name', None), getattr(row, 'code', None))
        assert row is not None

        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        resp = client.get(f"{base}/{sid}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        resp = client.put(f"{base}/{sid}", json={"name": "Updated Subject"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200

        sess2 = SessionLocal()
        try:
            row2 = query_subject_by_id(sess2, sid)
            print('DB name after update (fresh session):', getattr(row2, 'name', None))
            assert getattr(row2, 'name', None) == 'Updated Subject'
        finally:
            sess2.close()

        resp = client.delete(f"{base}/{sid}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_subject_by_id(sess3, sid)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    run_integration_tests()
