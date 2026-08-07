"""
Utility: print all registered FastAPI routes for debugging.
Run: python backend/print_routes.py
"""
import importlib


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

    routes = []
    for route in app.routes:
        try:
            name = getattr(route, 'name', '')
            path = getattr(route, 'path', None) or getattr(route, 'url_path', None) or str(route)
            methods = getattr(route, 'methods', None)
            routes.append((path, methods, name))
        except Exception:
            continue

    # Sort by path for easier reading
    routes.sort(key=lambda x: x[0] or '')
    for path, methods, name in routes:
        print(f"{path} {methods} {name}")


if __name__ == '__main__':
    main()
