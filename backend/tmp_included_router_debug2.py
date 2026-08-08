from app.main import app

for idx, route in enumerate(app.router.routes):
    if type(route).__name__ == '_IncludedRouter':
        ctx = getattr(route, 'include_context', None)
        print('--- included router', idx)
        print(' include_context prefix:', getattr(ctx, 'prefix', None))
        print(' include_context include_in_schema:', getattr(ctx, 'include_in_schema', None))
        print(' original_router type:', type(getattr(route, 'original_router', None)))
        orig = getattr(route, 'original_router', None)
        if orig is not None:
            try:
                print(' original_router prefix:', getattr(orig, 'prefix', None))
                print(' original_router tags:', getattr(orig, 'tags', None))
                print(' original_router routes count:', len(getattr(orig, 'routes', [])))
                for jdx, nested in enumerate(getattr(orig, 'routes', [])[:10]):
                    print('   nested', jdx, type(nested).__name__, getattr(nested, 'path', None), getattr(nested, 'methods', None), getattr(nested, 'name', None))
            except Exception as exc:
                print(' original_router inspect failed:', exc)
        print()
