import os
import sys
sys.path.insert(0, os.getcwd())
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
payload = {
    'employee_code': 'emp-test-1',
    'first_name': 'Alice',
    'last_name': 'Johnson',
    'email': 'alice@example.com',
    'designation': 'Developer',
    'department': 'Engineering',
    'status': 'Active',
}
r = client.post('/api/employees/', json=payload)
print('POST status', r.status_code, r.json())
print('LIST status', client.get('/api/employees/').status_code, client.get('/api/employees/').json())
