import os
import re

base = 'backend/app/api/v1'
prefixes = set()
for root, dirs, files in os.walk(base):
    for f in files:
        if f.endswith('.py'):
            with open(os.path.join(root, f), 'r', encoding='utf-8') as fh:
                text = fh.read()
            for m in re.finditer(r"prefix\s*=\s*['\"]?(/[^'\"]*)['\"]", text):
                prefixes.add(m.group(1).strip())
            for m in re.finditer(r"@router\.get\(\s*['\"]?(/[^'\"]*)['\"]", text):
                prefixes.add(m.group(1).strip())

print('BACKEND PREFIXES:')
for p in sorted(prefixes):
    print(p)
print('---')

with open('src/api/endpoints.js', 'r', encoding='utf-8') as fh:
    text = fh.read()
res = re.findall(r"\s*([A-Za-z0-9_]+):\s*'([A-Za-z0-9\-]+)'", text)
endpoints = {k: v for k, v in res}

print('FRONTEND ENDPOINTS:')
for k, v in sorted(endpoints.items()):
    print(f'{k} {v}')
print('---')

be = {p[1:] for p in prefixes if p.startswith('/')}
missing = [(k, v) for k, v in endpoints.items() if v not in be]
print('MISSING FROM BACKEND:')
for k, v in sorted(missing):
    print(f'{k} {v}')
