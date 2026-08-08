import sys
from pathlib import Path
sys.path.insert(0, str(Path(r'd:/Users/pop/Desktop/new pr/backend')))
from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.exam_calendar.router import router
app = FastAPI()
app.include_router(router)
client = TestClient(app)
resp = client.get('/exam-calendars/audit')
print('status', resp.status_code)
print('body', resp.text)
print('json', resp.json() if resp.headers.get('content-type','').startswith('application/json') else 'non-json')
