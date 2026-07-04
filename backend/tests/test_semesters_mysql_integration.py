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


def query_semester_by_id(sess, sid):
    from sqlalchemy import text
    row = sess.execute(text("SELECT id, name, academic_year_id FROM semesters WHERE id = :id"), {"id": sid}).first()
    if row is None:
        return None
    class Simple: pass
    obj = Simple()
    obj.id = row[0]
    obj.name = row[1]
    obj.academic_year_id = row[2]
    return obj


def run_integration_tests():
    client = TestClient(app)
    # create academic year prerequisite
    resp = client.post('/api/v1/academic-years/', json={'name': f'AY-{int(time.time())}', 'start_date': '2026-01-01', 'end_date': '2026-12-31'})
    assert resp.status_code == 201, resp.text
    ay = resp.json()['data']
    ay_id = ay['id']

    base = "/api/v1/semesters"
    payload = {"name": f"Integration Semester {int(time.time())}", "academic_year_id": ay_id}
    resp = client.post(base + "/", json=payload)
    print('POST status', resp.status_code, resp.text)
    assert resp.status_code == 201, resp.text
    created = resp.json()['data']
    sid = created['id']

    sess = SessionLocal()
    try:
        row = query_semester_by_id(sess, sid)
        print('DB row after create:', bool(row), getattr(row, 'name', None))
        assert row is not None

        resp = client.get(base + "/")
        print('LIST status', resp.status_code)
        assert resp.status_code == 200

        resp = client.get(f"{base}/{sid}")
        print('GET status', resp.status_code)
        assert resp.status_code == 200

        resp = client.put(f"{base}/{sid}", json={"name": "Updated Semester"})
        print('PUT status', resp.status_code, resp.text)
        assert resp.status_code == 200

        sess2 = SessionLocal()
        try:
            row2 = query_semester_by_id(sess2, sid)
            print('DB name after update (fresh session):', getattr(row2, 'name', None))
            assert getattr(row2, 'name', None) == 'Updated Semester'
        finally:
            sess2.close()

        resp = client.delete(f"{base}/{sid}")
        print('DELETE status', resp.status_code)
        assert resp.status_code == 204
        sess3 = SessionLocal()
        try:
            row_after = query_semester_by_id(sess3, sid)
            assert row_after is None
        finally:
            sess3.close()

    finally:
        sess.close()


if __name__ == '__main__':
    run_integration_tests()
