from fastapi.testclient import TestClient

from app.main import app


def test_dev_frontend_origin_is_allowed_for_cors():
    client = TestClient(app)
    response = client.get('/api/v1/health', headers={'Origin': 'http://127.0.0.1:5175'})

    assert response.status_code == 200
    assert response.headers.get('access-control-allow-origin') == 'http://127.0.0.1:5175'
