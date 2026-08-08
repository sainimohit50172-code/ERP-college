from app.main import app
from fastapi.routing import APIRoute

for idx, route in enumerate(app.routes):
    if hasattr(route, 'original_router'):
        orig = route.original_router
        include_ctx = getattr(route, 'include_context', None)
        print(f'ROUTE[{idx}] _IncludedRouter include_context={include_ctx}')
        print(f'  original_router type={type(orig).__name__} prefix={getattr(orig, "prefix", None)} routes={len(getattr(orig, "routes", []))}')
        for child in orig.routes[:10]:
            print('   child', type(child).__name__, getattr(child, 'path', None), getattr(child, 'methods', None), getattr(child, 'name', None))
    elif isinstance(route, APIRoute):
        print(f'ROUTE[{idx}] APIRoute path={route.path} methods={route.methods} name={route.name}')
    else:
        print(f'ROUTE[{idx}] OTHER type={type(route).__name__}')
