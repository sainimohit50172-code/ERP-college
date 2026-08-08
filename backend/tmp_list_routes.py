from app.main import app
from fastapi.routing import APIRoute


def dump_routes(routes, prefix=''):
    for route in routes:
        if isinstance(route, APIRoute):
            print(prefix + route.path, route.methods, type(route).__name__, route.name)
        elif hasattr(route, 'routes'):
            print(prefix + f'<{type(route).__name__}>')
            dump_routes(route.routes, prefix + '  ')
        else:
            print(prefix + f'<{type(route).__name__}> no path')

print('app routes:')
dump_routes(app.routes)

from app.api.v1.teachers import router as teachers_router
print('\nteachers_router routes:')
for route in teachers_router.routes:
    print(route.path, getattr(route, 'methods', None), type(route).__name__, getattr(route, 'name', None))
