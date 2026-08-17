import os
import sys
sys.path.insert(0, os.getcwd())
from app.db.database import engine, _sqlite_db_path
from sqlalchemy import inspect, text
from alembic.config import Config
from alembic import command
from app.core.config import get_settings
from fastapi.testclient import TestClient
from app.main import app

settings = get_settings()
print('settings.database_url', settings.database_url)
print('engine.url', engine.url)
print('sqlite_path', _sqlite_db_path(str(engine.url)))

with engine.connect() as conn:
    insp = inspect(conn)
    cols = [c['name'] for c in insp.get_columns('miscellaneous_remarks')]
    print('misc columns', cols)
    version = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
    print('alembic_version', version[0] if version else None)

conf = Config('alembic.ini')
conf.set_main_option('sqlalchemy.url', settings.database_url)
command.current(conf, verbose=True)

client = TestClient(app)
print('GET list status', client.get('/api/v1/miscellaneous-remarks').status_code)
post_resp = client.post('/api/v1/miscellaneous-remarks', json={'remark_name':'Temp Remark', 'remark':'Temp detail', 'amount':123.45, 'status':'Active'})
print('POST status', post_resp.status_code)
print('POST body', post_resp.text)
if post_resp.status_code in (200, 201):
    item = post_resp.json()
    item_id = item.get('id')
    print('created id', item_id)
    get_resp = client.get(f'/api/v1/miscellaneous-remarks/{item_id}')
    print('GET item status', get_resp.status_code)
    print('GET item body', get_resp.text)
    put_resp = client.put(f'/api/v1/miscellaneous-remarks/{item_id}', json={'remark_name':'Temp Remark Updated', 'remark':'Temp detail updated', 'amount':200.00, 'status':'Inactive'})
    print('PUT status', put_resp.status_code)
    print('PUT body', put_resp.text)
    delete_resp = client.delete(f'/api/v1/miscellaneous-remarks/{item_id}')
    print('DELETE status', delete_resp.status_code)
    print('DELETE body', delete_resp.text)
