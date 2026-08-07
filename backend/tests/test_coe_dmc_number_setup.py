from fastapi.testclient import TestClient

from app.main import app


def test_dmc_number_setup_list_uses_real_coe_router():
    with TestClient(app) as client:
        response = client.get('/api/v1/coe/dmc-number-setup')

    assert response.status_code == 200
    payload = response.json()
    assert payload['success'] is True
    assert payload['data'] == []
    assert payload['message'] == 'DMC number settings loaded'
