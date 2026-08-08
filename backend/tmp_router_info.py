from app.main import app

print('app.router type:', type(app.router), app.router.__class__)
print('router module:', app.router.__class__.__module__)
print('has matches:', hasattr(app.router, 'matches'))
print('has route:', hasattr(app.router, 'route'))
print('has url_path_for:', hasattr(app.router, 'url_path_for'))
print('supported attrs:', [a for a in dir(app.router) if a in ['matches','match','route','url_path_for','routes','include_router','add_route']])
print('')

try:
    import inspect
    print('matches signature:', inspect.signature(app.router.matches))
except Exception as exc:
    print('inspect failed:', exc)

scope = {'type': 'http', 'method': 'POST', 'path': '/api/v1/teachers', 'root_path': '', 'scheme': 'http', 'headers': [], 'query_string': b''}
try:
    match, updates = app.router.matches(scope)
    print('match result', match, 'updates', updates)
    print('match name:', getattr(match, 'name', None))
    print('match endpoint:', getattr(match, 'endpoint', None))
except Exception as exc:
    print('matches raised', exc)
