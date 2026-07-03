import urllib.request

urls=[
    'http://localhost:5173/api/departments',
    'http://localhost:5173/api/courses',
    'http://localhost:5173/api/students',
    'http://localhost:5173/api/teachers',
    'http://localhost:5173/api/employees',
]

for u in urls:
    try:
        req=urllib.request.Request(u, headers={'User-Agent':'curl/7.0'})
        with urllib.request.urlopen(req, timeout=5) as r:
            data=r.read(500).decode('utf-8',errors='replace')
            print(u, r.status, data[:200])
    except Exception as e:
        import urllib.error
        if isinstance(e, urllib.error.HTTPError):
            try:
                body = e.read().decode('utf-8', errors='replace')
            except Exception:
                body = '<no body>'
            print(u, 'HTTPError', e.code, body)
        else:
            print(u, 'ERROR', repr(e))
