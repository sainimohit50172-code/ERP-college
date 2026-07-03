from starlette.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    resp = client.get('/health')
    print(resp.status_code)
    print(resp.json())
