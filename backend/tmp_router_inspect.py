import app.main as main
from fastapi.routing import APIRoute

print('routers list length:', len(main.routers))
for idx, r in enumerate(main.routers):
    print(idx, type(r).__name__, getattr(r, 'prefix', None), getattr(r, 'routes', None) and len(r.routes))
    if hasattr(r, 'routes'):
        print('  child route count:', len(r.routes))
        for route in r.routes[:5]:
            print('   ', getattr(route, 'path', None), getattr(route, 'methods', None), type(route).__name__)

print('\napp.router routes count:', len([route for route in main.app.router.routes if isinstance(route, APIRoute)]))
print('api/v1 paths:')
for route in main.app.router.routes:
    if isinstance(route, APIRoute) and route.path.startswith('/api/v1'):
        print(route.path, route.methods, route.name)
