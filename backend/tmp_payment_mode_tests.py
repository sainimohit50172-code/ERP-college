import urllib.request
import urllib.error
import json
import time
from datetime import datetime

BASE = 'http://127.0.0.1:8000/api/v1/payment-modes'

headers = {'Content-Type': 'application/json'}


def do_request(method, url, payload=None):
    data = None
    if payload is not None:
        data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            body = resp.read().decode('utf-8')
            try:
                body_json = json.loads(body)
            except Exception:
                body_json = body
            return status, body_json
    except urllib.error.HTTPError as e:
        try:
            b = e.read().decode('utf-8')
            return e.code, json.loads(b)
        except Exception:
            return e.code, str(e)
    except Exception as exc:
        return None, str(exc)


# wait for server
for i in range(10):
    status, body = do_request('GET', BASE)
    if status == 200:
        print('SERVER_READY')
        break
    time.sleep(1)
else:
    print('SERVER_NOT_READY', status, body)
    raise SystemExit(1)

# initial GET
status, body = do_request('GET', BASE)
print('INITIAL_GET', status, (len(body.get('data').get('items')) if isinstance(body, dict) and body.get('data') else 'N/A'))

# create three modes
modes = [
    {"modeName": "Cash", "code": "CASH", "description": "Cash payment", "status": "Active"},
    {"modeName": "Online", "code": "ONLINE", "description": "Online payment", "status": "Active"},
    {"modeName": "Bank Transfer", "code": "BANK", "description": "Bank transfer", "status": "Active"},
]
created = {}
for m in modes:
    status, body = do_request('POST', BASE, m)
    print('CREATE', m['code'], status)
    print(json.dumps(body))
    if status in (200,201):
        data = body.get('data') if isinstance(body, dict) else None
        if data and isinstance(data, dict) and data.get('id'):
            created[m['code']] = data.get('id')

# verify all created
status, body = do_request('GET', BASE)
print('AFTER_CREATE_GET', status)
if isinstance(body, dict) and body.get('data'):
    items = body['data']['items']
    codes = [it.get('code') for it in items]
    print('CODES_IN_DB', codes)

# update Cash to set activatedAt
if 'CASH' in created:
    cid = created['CASH']
    payload = {"modeName": "Cash", "code": "CASH", "description": "Cash payment", "status": "Active", "activatedAt": datetime.utcnow().isoformat()}
    status, body = do_request('PUT', f"{BASE}/{cid}", payload)
    print('UPDATE_CASH', status)
    print(json.dumps(body))

# set Online to inactive
if 'ONLINE' in created:
    oid = created['ONLINE']
    payload = {"modeName": "Online", "code": "ONLINE", "description": "Online payment", "status": "Inactive"}
    status, body = do_request('PUT', f"{BASE}/{oid}", payload)
    print('UPDATE_ONLINE_INACTIVE', status)
    print(json.dumps(body))

# verify states
status, body = do_request('GET', BASE)
print('VERIFY_STATES', status)
if isinstance(body, dict) and body.get('data'):
    items = body['data']['items']
    for it in items:
        print('MODE', it.get('id'), it.get('modeName') if 'modeName' in it else it.get('mode_name'), it.get('code'), it.get('status'))

# duplicate test
dup = {"modeName": "Cash Duplicate", "code": "CASH", "description": "Duplicate code", "status": "Active"}
status, body = do_request('POST', BASE, dup)
print('DUPLICATE_CREATE', status)
print(json.dumps(body))

print('TEST_DONE')
