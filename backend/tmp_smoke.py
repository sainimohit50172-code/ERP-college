import json, traceback
from urllib import request, error

urls = [
    'http://127.0.0.1:8000/api/health',
    'http://127.0.0.1:8000/api/coe/exam-shifts',
    'http://127.0.0.1:8000/api/coe/manage-bundles',
    'http://127.0.0.1:8000/api/coe/dmc-number-setup',
    'http://127.0.0.1:8000/api/coe/dmc-student-app',
    'http://127.0.0.1:8000/api/coe/dmc-student-app/global',
    'http://127.0.0.1:8000/api/coe/exam-form-preferences/settings',
    'http://127.0.0.1:8000/api/exam-calendars',
]

for u in urls:
    print('---')
    print('Request URL:', u)
    try:
        req = request.Request(u, method='GET')
        with request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            body = resp.read().decode('utf-8', errors='replace')
            print('HTTP Status:', status)
            try:
                parsed = json.loads(body)
                print('Response Body (json):')
                print(json.dumps(parsed, indent=2))
            except Exception:
                print('Response Body (text):')
                if len(body) > 2000:
                    print(body[:2000] + '\n...[truncated]')
                else:
                    print(body)
            if status >= 500:
                print('Server returned status >=500; examine backend logs for traceback')
    except error.HTTPError as he:
        status = he.code
        try:
            body = he.read().decode('utf-8', errors='replace')
        except Exception:
            body = '<unable to read body>'
        print('HTTP Status:', status)
        print('Response Body (error):')
        if len(body) > 2000:
            print(body[:2000] + '\n...[truncated]')
        else:
            print(body)
    except Exception as e:
        print('HTTP Request raised exception:', type(e).__name__, e)
        print('Traceback:')
        traceback.print_exc()

print('\nDone')
