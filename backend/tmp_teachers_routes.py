from app.api.v1.teachers import router as teachers_router

print('teachers router routes count:', len(teachers_router.routes))
for i, route in enumerate(teachers_router.routes):
    print(i, type(route).__name__, getattr(route, 'path', None), getattr(route, 'methods', None), getattr(route, 'name', None))
