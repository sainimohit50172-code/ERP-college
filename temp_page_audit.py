from pathlib import Path
import re

root = Path('src/pages')
pattern = re.compile(r'return\s*\(\s*<div[^>]*className="([^"]*)"', re.S)
files = sorted([p for p in root.iterdir() if p.suffix == '.jsx'])
rows = []
counts = {}
for p in files:
    txt = p.read_text(encoding='utf-8')
    m = pattern.search(txt)
    wrapper = m.group(1).strip() if m else '<NO MATCH>'
    rows.append((p.name, wrapper))
    counts[wrapper] = counts.get(wrapper, 0) + 1
with open('page_wrapper_audit.csv', 'w', encoding='utf-8', newline='') as f:
    f.write('file,wrapper\n')
    for fn, wrapper in rows:
        wrapper_safe = wrapper.replace(',', ';')
        f.write(f'{fn},{wrapper_safe}\n')
print('unique wrappers:', len(counts))
for wrapper, count in sorted(counts.items(), key=lambda item: -item[1]):
    print(count, repr(wrapper))
print('WROTE page_wrapper_audit.csv')
