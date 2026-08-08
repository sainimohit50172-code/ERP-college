from app.main import app

for idx, route in enumerate(app.router.routes):
    route_type = type(route).__name__
    print(f'[{idx}] {route_type} path={getattr(route, "path", None)} methods={getattr(route, "methods", None)} name={getattr(route, "name", None)}')
    for attr in ["router", "routes", "include_in_schema", "prefix", "path_regex"]:
        if hasattr(route, attr):
            print(f'    {attr} =', getattr(route, attr))
    if hasattr(route, 'router'):
        subrouter = route.router
        print('    subrouter type:', type(subrouter).__name__)
        print('    subrouter routes len:', len(getattr(subrouter, 'routes', [])))
        for jdx, nested in enumerate(getattr(subrouter, 'routes', [])):
            print(f'      [{idx}.{jdx}] {type(nested).__name__} path={getattr(nested, "path", None)} methods={getattr(nested, "methods", None)} name={getattr(nested, "name", None)}')
    print('')
