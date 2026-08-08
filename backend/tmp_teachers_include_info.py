from app.main import app

for idx, route in enumerate(app.router.routes):
    if type(route).__name__ == '_IncludedRouter':
        orig = getattr(route, 'original_router', None)
        if orig is None:
            continue
        prefix = getattr(orig, 'prefix', None)
        if prefix == '/teachers':
            print('included router idx', idx)
            print('include_context prefix', getattr(route.include_context, 'prefix', None))
            print('orig prefix', prefix)
            print('orig tags', getattr(orig, 'tags', None))
            print('orig routes count', len(getattr(orig, 'routes', [])))
            for jdx, nested in enumerate(getattr(orig, 'routes', [])):
                print(' nested', jdx, type(nested).__name__, getattr(nested, 'path', None), getattr(nested, 'methods', None), getattr(nested, 'name', None))
            print()

print('done')
