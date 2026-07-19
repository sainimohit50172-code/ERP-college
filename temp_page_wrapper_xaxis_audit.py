from pathlib import Path
import re

root = Path('src/pages')
pattern = re.compile(r'return\s*\(\s*<(.+?)>', re.S)

for p in sorted(root.glob('*.jsx')):
    txt = p.read_text(encoding='utf-8')
    idx = txt.find('return (')
    if idx == -1:
        idx = txt.find('return(')
    if idx == -1:
        continue
    segment = txt[idx:idx+400]
    m = re.search(r'<(div|main|section|article|div[^>]*)([^>]*)>', segment)
    if not m:
        continue
    attrs = m.group(2)
    cm = re.search(r'className="([^"]*)"', attrs)
    if not cm:
        continue
    cls = cm.group(1)
    if re.search(r'(?:\bpx-|\bpl-|\bpr-|\bmx-|\bml-|\bmr-)', cls):
        print(p.name, cls)
