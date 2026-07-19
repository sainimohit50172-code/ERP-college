import os
import sys
import datetime
from fastapi.testclient import TestClient
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))
from app.main import app

client = TestClient(app)
base = '/api/v1/employees'
now = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S%f')
payload = {
    'employee_code': f'INT-EMP-{now}',
    'first_name': 'Test',
    'last_name': 'User',
    'email': f'test.user+{now}@example.com',
    'phone': '1234567890',
    'status': 'Active',
}
resp = client.post(base + '/', json=payload)
print('CREATE', resp.status_code, resp.text)
if resp.status_code != 201:
    sys.exit(1)
emp_id = resp.json()['data']['id']
resp = client.put(f'{base}/{emp_id}', json={'first_name': 'Updated', 'email': f'updated+{now}@example.com'})
print('UPDATE', resp.status_code, resp.text)
resp = client.get(f'{base}/{emp_id}')
print('GET', resp.status_code, resp.text)
