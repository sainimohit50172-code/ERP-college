import os
import re
import sys
from pathlib import Path

ROOT = Path(r'd:\Users\pop\Desktop\new pr')
sys.path.insert(0, str(ROOT / 'backend'))
from app.main import app

hook_pattern = re.compile(r"(?:useResourceList|useResourceDetails|useCreateResource|useUpdateResource|useDeleteResource)\s*\(\s*['\"]([^'\"]+)['\"]")

resources = set()
for root, _, files in os.walk(ROOT / 'src'):
    for filename in files:
        if not filename.endswith(('.js', '.jsx', '.ts', '.tsx')):
            continue
        path = Path(root) / filename
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        for match in hook_pattern.finditer(text):
            resources.add(match.group(1))

endpoints_text = (ROOT / 'src/api/endpoints.js').read_text(encoding='utf-8')
endpoint_map = {}
match = re.search(r'const endpoints\s*=\s*\{(.*?)\n\};', endpoints_text, re.S)
if match:
    body = match.group(1)
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith('//') or ':' not in line:
            continue
        key, value = line.split(':', 1)
        key = key.strip().strip("'\"")
        value = value.strip().rstrip(',')
        if value.startswith("'") or value.startswith('"'):
            value = value[1:-1]
        endpoint_map[key] = value

# Build app route set from app.routes
route_paths = {}
for route in app.routes:
    path = getattr(route, 'path', None)
    methods = getattr(route, 'methods', None)
    if not path:
        continue
    route_paths.setdefault(path, set()).update({m.lower() for m in methods or []})

results = []
for resource in sorted(resources):
    endpoint = endpoint_map.get(resource, resource)
    base_path = f'/api/v1/{endpoint}/'
    detail_path = f'/api/v1/{endpoint}/1'
    results.append((resource, endpoint, base_path, detail_path))

for resource, endpoint, base_path, detail_path in results:
    list_methods = route_paths.get(base_path, set())
    detail_methods = route_paths.get(detail_path, set())
    print(resource, '=>', endpoint, 'list', sorted(list_methods), 'detail', sorted(detail_methods))
