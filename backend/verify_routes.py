"""
Verify FastAPI routes for duplicates and suspicious paths like /api/api.
Run: python backend/verify_routes.py
"""
import importlib
from collections import defaultdict


def main():
    try:
        mod = importlib.import_module('app.main')
    except Exception as e:
        print('ERROR: failed to import app.main:', e)
        return
    app = getattr(mod, 'app', None)
    if app is None:
        print('ERROR: app not found in app.main')
        return

    seen = defaultdict(list)
    api_api_paths = []
    for route in app.routes:
        path = getattr(route, 'path', None) or getattr(route, 'url_path', None) or str(route)
        methods = getattr(route, 'methods', None)
        key = (path, tuple(sorted(methods)) if methods else None)
        seen[key].append(route)
        if '/api/api' in (path or ''):
            api_api_paths.append(path)

    duplicates = {k: v for k, v in seen.items() if len(v) > 1}

    print('Total routes:', len(app.routes))
    print('Duplicate route entries (path + methods) count:', len(duplicates))
    if duplicates:
        print('Duplicates:')
        for (path, methods), routes in duplicates.items():
            print(f'  {path} {methods} -> {len(routes)} registrations')

    if api_api_paths:
        print('Found /api/api paths:')
        for p in api_api_paths:
            print('  ', p)
    else:
        print('No /api/api occurrences found')

    # Print a concise route list
    print('\nRegistered routes:')
    for route in sorted(app.routes, key=lambda r: getattr(r, 'path', str(r)) or ''):
        path = getattr(route, 'path', None) or getattr(route, 'url_path', None) or str(route)
        methods = getattr(route, 'methods', None)
        name = getattr(route, 'name', None)
        print(f'{path} {methods} {name}')


if __name__ == '__main__':
    main()
