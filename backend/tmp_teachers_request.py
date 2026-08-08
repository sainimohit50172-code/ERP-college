from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    for path in ['/api/v1/teachers', '/api/v1/teachers/', '/api/teachers', '/api/teachers/']:
        r = client.post(path, json={'employee_id': 2, 'teacher_code': 'T-002'})
        print(path, r.status_code, r.text)
    for path in ['/api/v1/teachers/import', '/api/teachers/import']:
        r = client.post(path, files={'file': ('teachers.csv', 'employee_id,teacher_code\n2,T-002\n', 'text/csv')})
        print(path, r.status_code, r.text)
