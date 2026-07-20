import re
from pathlib import Path
p = Path('src/components/ui/InfoCard.jsx')
text = p.read_text(encoding='utf-8')
pattern = re.compile(r'<(button|a|input|select|textarea|div|article|section|li|span)\b([^>]*)>', re.I)


def transform(match):
    full_tag = match.group(0)
    attrs = match.group(2)
    if 'hover-gradient-border' in attrs:
        return full_tag
    if re.search(r'className\s*=\s*["\']', attrs):
        return re.sub(r'(className\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)
    if re.search(r'class\s*=\s*["\']', attrs):
        return re.sub(r'(class\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)
    return full_tag[:-1] + ' className="hover-gradient-border">'

new_text = pattern.sub(transform, text)
print(new_text.splitlines()[0])
print('changed' if new_text != text else 'unchanged')
p.write_text(new_text, encoding='utf-8')
