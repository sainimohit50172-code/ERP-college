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


def query_course_by_id(sess, cid):
    from sqlalchemy import text
    row = sess.execute(text("SELECT id, name, code, department_id FROM courses WHERE id = :id"), {"id": cid}).first()
    if row is None:
        return None
    class Simple: pass
    obj = Simple()
    obj.id = row[0]
    obj.name = row[1]
    obj.code = row[2]
    obj.department_id = row[3]
    return obj


def run_integration_tests():
    client = TestClient(app)
    base = "/api/v1/courses"

    payload = {"name": f"Integration Course {int(time.time())}", "code": f"C-{int(time.time())}"}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    cid = created['id']

    sess = SessionLocal()
    try:
        row = query_course_by_id(sess, cid)
        print('DB row after create:', bool(row), getattr(row, 'name', None), getattr(row, 'code', None))
        assert row is not None

        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        resp = client.get(f"{base}/{cid}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        resp = client.put(f"{base}/{cid}", json={"name": "Updated Course"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200

        sess2 = SessionLocal()
        try:
            row2 = query_course_by_id(sess2, cid)
            print('DB name after update (fresh session):', getattr(row2, 'name', None))
            assert getattr(row2, 'name', None) == 'Updated Course'
        finally:
            sess2.close()

        resp = client.delete(f"{base}/{cid}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_course_by_id(sess3, cid)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    run_integration_tests()
