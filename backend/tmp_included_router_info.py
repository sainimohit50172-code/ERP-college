from app.main import app

for idx, route in enumerate(app.router.routes):
    print(f'[{idx}] {type(route).__name__}')
    if type(route).__name__ == '_IncludedRouter':
        print('   prefix:', getattr(route, 'prefix', None))
        print('   include_in_schema:', getattr(route, 'include_in_schema', None))
        print('   routes count:', len(route.routes))
        for jdx, nested in enumerate(route.routes[:20]):
            print(f'     [{idx}.{jdx}] {type(nested).__name__} path={getattr(nested, "path", None)} methods={getattr(nested, "methods", None)} name={getattr(nested, "name", None)}')
        if len(route.routes) > 20:
            print('     ...')
