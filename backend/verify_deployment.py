import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

print('PYTHON OK')

try:
    import backend.app.main as main
    print('IMPORT backend.app.main OK')
    app = getattr(main, 'app', None)
    print('HAS_APP', app is not None)
    if app is not None:
        print('APP_TYPE', type(app).__name__)
        route_info = []
        for route in getattr(app.router, 'routes', []):
            path = getattr(route, 'path', None)
            name = getattr(route, 'name', None)
            methods = getattr(route, 'methods', None)
            route_info.append((type(route).__name__, path, name, methods))
        print('ROUTE_COUNT', len(route_info))
        print('SAMPLE_ROUTES')
        for i, info in enumerate(route_info[:100], 1):
            print(i, info)
except Exception as exc:
    print('IMPORT_ERROR', repr(exc))
    import traceback
    traceback.print_exc()

try:
    import api.index as api_index
    print('IMPORT api.index OK')
    print('API_INDEX_HAS_APP', getattr(api_index, 'app', None) is not None)
except Exception as exc:
    print('IMPORT_API_INDEX_ERROR', repr(exc))
    import traceback
    traceback.print_exc()
