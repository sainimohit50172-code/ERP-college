import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / 'backend'))

import importlib

mod = importlib.import_module('app.main')
app = mod.app

print('Total routes:', len(app.routes))
for route in app.routes:
    path = getattr(route, 'path', None) or getattr(route, 'url_path', None) or str(route)
    if path and 'transport' in path:
        methods = getattr(route, 'methods', None)
        name = getattr(route, 'name', None)
        print(path, methods, name)
