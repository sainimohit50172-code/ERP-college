from fastapi.testclient import TestClient

from app.db.database import SessionLocal
from app.main import app
from app.models.exam_form_preferences.settings_models import CoeExamFormPreferenceSetting


def test_coe_preferences_round_trip():
    db = SessionLocal()
    try:
        db.query(CoeExamFormPreferenceSetting).delete()
        db.commit()
    finally:
        db.close()

    with TestClient(app) as client:
        get_response = client.get('/api/v1/coe/preferences')
        assert get_response.status_code == 200
        payload = get_response.json()['data']
        assert payload['studentAwakeStatus'] is False
        assert payload['autoApprove'] is False
        assert payload['personalDetailsCheck'] is False

        update_response = client.put('/api/v1/coe/preferences', json={
            'studentAwakeStatus': True,
            'autoApprove': True,
            'personalDetailsCheck': True,
            'examCalendarMode': 'Live',
        })
        assert update_response.status_code == 200
        updated_payload = update_response.json()['data']
        assert updated_payload['studentAwakeStatus'] is True
        assert updated_payload['autoApprove'] is True
        assert updated_payload['personalDetailsCheck'] is True
        assert updated_payload['examCalendarMode'] == 'Live'
