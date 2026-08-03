import re
from pathlib import Path
root = Path('d:/Users/pop/Desktop/new pr')
app = root / 'src' / 'App.jsx'
rbac = root / 'src' / 'services' / 'rbac.js'
text_app = app.read_text(encoding='utf-8')
keys = sorted(set(re.findall(r'moduleKey="([^"]+)"', text_app)))
print('App moduleKeys:', len(keys))
print('\n'.join(keys))
print('\n---\n')
text_rbac = rbac.read_text(encoding='utf-8')
mods = sorted(set(re.findall(r"\{ key: '([^']+)', label: '([^']+)' \}", text_rbac)))
module_keys = [m for m, _ in mods]
print('RBAC moduleKeys:', len(module_keys))
print('\n'.join(module_keys))
print('\n---\n')
print('Missing in RBAC:')
for key in keys:
    if key not in module_keys:
        print(key)
print('\nExtra in RBAC:')
for key in module_keys:
    if key not in keys:
        print(key)
