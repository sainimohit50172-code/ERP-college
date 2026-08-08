from app.main import app
from fastapi.routing import APIRoute

visited = set()

def dump(route, prefix=''):
    if id(route) in visited:
        return
    visited.add(id(route))
    if isinstance(route, APIRoute):
        print(prefix + route.path, route.methods, route.name)
    else:
        child_routes = getattr(route, 'routes', None)
        if child_routes is not None:
            print(prefix + f'<{type(route).__name__}>')
            for child in child_routes:
                dump(child, prefix + '  ')
        else:
            print(prefix + f'<{type(route).__name__}> no routes')

for route in app.routes:
    dump(route)
