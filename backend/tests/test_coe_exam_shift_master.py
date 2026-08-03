from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.exam_fee_setup.exam_shift import CoeExamShift


def test_coe_exam_shift_crud():
    db = SessionLocal()
    try:
        db.query(CoeExamShift).delete()
        db.commit()
    finally:
        db.close()

    with TestClient(app) as client:
        response = client.get('/api/v1/coe/exam-shifts')
        assert response.status_code == 200
        assert response.json()['data'] == []

        payload = {'shiftName': 'Morning Shift', 'startTime': '08:00', 'endTime': '11:00'}
        create_response = client.post('/api/v1/coe/exam-shifts', json=payload)
        assert create_response.status_code == 200
        data = create_response.json()['data']
        assert data['shiftName'] == 'Morning Shift'
        assert data['startTime'] == '08:00'
        assert data['endTime'] == '11:00'
        assert data['status'] == 'Active'

        duplicate_response = client.post('/api/v1/coe/exam-shifts', json=payload)
        assert duplicate_response.status_code == 400

        bad_time_response = client.post('/api/v1/coe/exam-shifts', json={'shiftName': 'Evening', 'startTime': '15:00', 'endTime': '14:00'})
        assert bad_time_response.status_code == 422 or bad_time_response.status_code == 400

        list_response = client.get('/api/v1/coe/exam-shifts')
        assert list_response.status_code == 200
        assert len(list_response.json()['data']) == 1
