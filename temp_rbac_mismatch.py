import re
from pathlib import Path
root = Path('d:/Users/pop/Desktop/new pr')
rbac = root / 'src' / 'services' / 'rbac.js'
text = rbac.read_text(encoding='utf-8')
module_keys = re.findall(r"\{ key: '([^']+)', label: '([^']+)' \}", text)
module_keys = [k for k,_ in module_keys]
role_sections = re.split(r"\n  '([A-Za-z0-9 ]+)': \{\n", text)[1:]
# role_sections: [role1, body1, role2, body2,...]
roles = {}
for role, body in zip(role_sections[0::2], role_sections[1::2]):
    keys = re.findall(r"\n    ([A-Za-z0-9]+): \['[a-zA-Z', ]*\]", body)
    roles[role] = keys
all_keys = set(module_keys)
print('Module keys count', len(module_keys))
for role, keys in roles.items():
    bad = [k for k in keys if k not in all_keys]
    if bad:
        print('Role', role, 'bad keys', bad)
print('--- role keys not in module keys ---')

# also check module keys with no role mapping for any role besides all
role_keys = set(k for keys in roles.values() for k in keys)
missing = [k for k in module_keys if k not in role_keys]
print('Module keys not referenced in any roleActions:', missing)
