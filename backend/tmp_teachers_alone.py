from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.api.v1.teachers import router as teachers_router_module

app = FastAPI()
app.include_router(teachers_router_module.router, prefix='/api/v1')

with TestClient(app) as client:
    for idx, path in enumerate(['/api/v1/teachers', '/api/v1/teachers/'], start=1):
        r = client.post(path, json={'employee_id': idx + 2, 'teacher_code': f'T-00{idx}'})
        print('PATH', path, 'status', r.status_code, 'text', r.text)
