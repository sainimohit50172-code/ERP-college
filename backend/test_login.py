import json
from urllib import request, error

payload = {'email': 'admin@collegeerp.local', 'password': 'Admin@123'}
for url in ['http://127.0.0.1:8000/api/auth/login', 'http://127.0.0.1:8000/api/v1/auth/login']:
    try:
        data = json.dumps(payload).encode('utf-8')
        req = request.Request(url, data=data, headers={'Content-Type': 'application/json'}, method='POST')
        resp = request.urlopen(req, timeout=10)
        print('URL:', url)
        print('STATUS:', resp.status)
        print(resp.read().decode('utf-8'))
    except error.HTTPError as e:
        print('URL:', url)
        print('HTTP ERROR:', e.code)
        print(e.read().decode('utf-8'))
    except Exception as exc:
        print('URL:', url)
        print('ERROR:', exc)
