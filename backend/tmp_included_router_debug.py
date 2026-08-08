from app.main import app

for idx, route in enumerate(app.router.routes):
    if type(route).__name__ == '_IncludedRouter':
        print('--- included router', idx)
        print('type:', type(route))
        for attr in ['router', 'prefix', 'path_regex', 'path', 'name', 'include_in_schema', 'dependencies', 'redirect_slashes']:
            if hasattr(route, attr):
                print(f'{attr} =', getattr(route, attr))
        nested = getattr(route, 'router', None)
        if nested is not None:
            print(' nested type', type(nested))
            nested_routes = getattr(nested, 'routes', None)
            print(' nested routes count', len(nested_routes) if nested_routes is not None else None)
            if nested_routes:
                for jdx, nested_route in enumerate(nested_routes[:20]):
                    print('   ', jdx, type(nested_route).__name__, getattr(nested_route, 'path', None), getattr(nested_route, 'methods', None), getattr(nested_route, 'name', None))
        print()
