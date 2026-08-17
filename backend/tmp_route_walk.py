from app.main import app


def walk(route, prefix=''):
    cls = route.__class__.__name__
    path = getattr(route, 'path', None)
    name = getattr(route, 'name', None)
    methods = getattr(route, 'methods', None)
    routes = getattr(route, 'routes', None)
    print(f'CLASS={cls} PATH={path!r} NAME={name!r} METHODS={methods!r} ROUTES={len(routes) if routes is not None else None}')
    if routes:
        for sub in routes:
            walk(sub, prefix + (path or ''))

for route in app.routes:
    walk(route)
