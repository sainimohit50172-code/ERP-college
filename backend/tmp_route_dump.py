from app.main import app

print('app routes count:', len(app.routes))
for i, route in enumerate(app.routes):
    path = getattr(route, 'path', None)
    methods = getattr(route, 'methods', None)
    name = getattr(route, 'name', None)
    print(i, type(route).__name__, path, methods, name)
