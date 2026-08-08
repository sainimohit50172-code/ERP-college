import fastapi
import starlette
import inspect
from app.main import app

print('fastapi', fastapi.__version__)
print('starlette', starlette.__version__)
print('app.router type', type(app.router))
print('has app.router.matches', hasattr(app.router, 'matches'))
print('app.router.matches signature', inspect.signature(app.router.matches))
print('app.router.matches source:')
print(inspect.getsource(app.router.matches))
print('--- MRO ---')
for c in type(app.router).mro():
    print(' ', c)
print('--- route count ---', len(app.router.routes))

scope = {
    'type': 'http',
    'method': 'POST',
    'path': '/api/v1/teachers',
    'root_path': '',
    'scheme': 'http',
    'query_string': b'',
    'headers': [],
    'client': ('127.0.0.1', 12345),
    'server': ('testserver', 80),
    'http_version': '1.1',
}
match, updates = app.router.matches(scope)
print('match for /api/v1/teachers:', match, 'name', getattr(match, 'name', None), 'endpoint', getattr(match, 'endpoint', None))
print('updates', updates)
