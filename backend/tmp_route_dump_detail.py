from app.main import app

for idx, route in enumerate(app.router.routes):
    print(f'[{idx}] {type(route).__name__} path={getattr(route, "path", None)} methods={getattr(route, "methods", None)} name={getattr(route, "name", None)}')
    if hasattr(route, 'routes'):
        for jdx, nested in enumerate(route.routes):
            print(f'   [{idx}.{jdx}] {type(nested).__name__} path={getattr(nested, "path", None)} methods={getattr(nested, "methods", None)} name={getattr(nested, "name", None)}')
