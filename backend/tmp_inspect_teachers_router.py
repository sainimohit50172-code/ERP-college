from app.main import app
from app.api.v1.teachers import router as teachers_router

print('main app routes count:', len(app.routes))
print('teachers_router type:', type(teachers_router))
print('router attr exists:', hasattr(teachers_router, 'router'))
print('router type:', type(teachers_router.router))
print('route count:', len(teachers_router.router.routes))
for route in teachers_router.router.routes:
    print(route.path, route.methods, route.name, type(route).__name__)

try:
    print('\nmain routers objects:')
    for r in app.routes:
        print(type(r), getattr(r, 'path', None), getattr(r, 'methods', None))
except Exception as exc:
    print('failed to inspect app routes:', exc)
