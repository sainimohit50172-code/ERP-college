from app.api.v1.teachers import router as teachers_module

for route in teachers_module.router.routes:
    print(repr(route.path), route.methods, route.name)
