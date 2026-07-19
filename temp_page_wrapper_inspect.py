from pathlib import Path
import re

root = Path('src/pages')
files = sorted([p for p in root.iterdir() if p.suffix == '.jsx'])
results = []
for p in files:
    txt = p.read_text(encoding='utf-8')
    idx = txt.find('return (')
    if idx == -1:
        idx = txt.find('return<')
    if idx == -1:
        results.append((p.name, '<NO RETURN>', ''))
        continue
    sub = txt[idx:idx+800]
    m = re.search(r'<(\w+)([^>]*)>', sub)
    if not m:
        results.append((p.name, '<NO TAG>', ''))
        continue
    tag = m.group(1)
    attrs = m.group(2)
    cls = ''
    cm = re.search(r'className="([^"]*)"', attrs)
    if cm:
        cls = cm.group(1).strip()
    results.append((p.name, tag, cls))

for r in results:
    print(','.join([r[0], r[1], r[2].replace(',', ';')]))
