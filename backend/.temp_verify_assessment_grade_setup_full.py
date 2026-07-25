from fastapi.testclient import TestClient
from app.main import app
from app.db.database import engine
from sqlalchemy import text

client = TestClient(app)
base = '/api/v1/assessment-grade-setups'

print('BASE', base)

def dump(resp):
    print('status', resp.status_code)
    print('text', resp.text)
    try:
        print('json', resp.json())
    except Exception as exc:
        print('json error', type(exc).__name__, exc)

print('\nGET list')
resp = client.get(base + '/')
dump(resp)

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
print('\nPOST create')
resp = client.post(base + '/', json=payload)
dump(resp)
created = None
if resp.status_code == 201:
    created = resp.json().get('data')
    record_id = created.get('id')
    print('Created ID', record_id)
else:
    raise SystemExit('Create failed')

print('\nGET detail')
resp = client.get(base + f'/{record_id}')
dump(resp)

print('\nPUT update')
resp = client.put(base + f'/{record_id}', json={'name': 'Runtime Test Grade Updated', 'description': 'Updated record', 'status': 'Inactive'})
dump(resp)

print('\nGET detail after update')
resp = client.get(base + f'/{record_id}')
dump(resp)

print('\nGET list paginated')
resp = client.get(base + '/?page=1&pageSize=20')
dump(resp)

print('\nDELETE')
resp = client.delete(base + f'/{record_id}')
print('status', resp.status_code)
print('text', resp.text)
try:
    print('json', resp.json())
except Exception as exc:
    print('json error', type(exc).__name__, exc)

print('\nGET deleted')
resp = client.get(base + f'/{record_id}')
dump(resp)

print('\nPOST invalid payload')
resp = client.post(base + '/', json={'code': 'BAD', 'status': 'Active'})
dump(resp)

print('\nPUT nonexistent')
resp = client.put(base + '/99999999', json={'name': 'Nonexistent'})
dump(resp)

print('\nDB Schema: SHOW CREATE TABLE assessment_grade_setups')
with engine.connect() as conn:
    result = conn.execute(text("SHOW CREATE TABLE assessment_grade_setups"))
    for row in result:
        print(row[1])
    print('\nDB Indexes: SHOW INDEX FROM assessment_grade_setups')
    result = conn.execute(text("SHOW INDEX FROM assessment_grade_setups"))
    for row in result:
        print(dict(row))
