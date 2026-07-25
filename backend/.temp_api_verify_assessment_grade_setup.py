from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
base = '/api/v1/assessment-grade-setups'

print('BASE', base)

resp = client.get(base + '/')
print('GET list', resp.status_code)
print(resp.json())

payload = {
    'name': 'Runtime Test Grade',
    'code': 'RTG1',
    'grade_band': 'A+',
    'min_score': 90,
    'max_score': 100,
    'grade_point': 4.5,
    'status': 'Active',
    'description': 'Created during runtime verification'
}
resp = client.post(base + '/', json=payload)
print('POST create', resp.status_code)
print(resp.json())
created = resp.json().get('data')
if created is None:
    raise SystemExit('Create failed')
record_id = created.get('id')
print('Created ID', record_id)

resp = client.get(base + f'/{record_id}')
print('GET detail', resp.status_code)
print(resp.json())

resp = client.put(base + f'/{record_id}', json={'name': 'Runtime Test Grade Updated', 'description': 'Updated record', 'status': 'Inactive'})
print('PUT update', resp.status_code)
print(resp.json())

resp = client.get(base + f'/{record_id}')
print('GET detail after update', resp.status_code)
print(resp.json())

resp = client.get(base + '/?page=1&pageSize=20')
print('GET list paginated', resp.status_code)
print(resp.json().get('data', {}).get('page'), resp.json().get('data', {}).get('page_size'))

resp = client.delete(base + f'/{record_id}')
print('DELETE', resp.status_code)
print(resp.json())

resp = client.get(base + f'/{record_id}')
print('GET deleted', resp.status_code)
print(resp.json())

resp = client.post(base + '/', json={'code': 'BAD', 'status': 'Active'})
print('POST invalid', resp.status_code)
print(resp.json())

resp = client.put(base + '/99999999', json={'name': 'Nonexistent'})
print('PUT nonexistent', resp.status_code)
print(resp.json())
