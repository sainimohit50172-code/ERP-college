import re
from pathlib import Path

root = Path('src')
files = [p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in {'.jsx', '.tsx'} and 'node_modules' not in p.parts]
files.sort()

changed = []

for path in files:
    text = path.read_text(encoding='utf-8')
    original = text

    # Fix malformed event handlers inserted by the earlier broad pass
    text = re.sub(r'(\bon[A-Za-z]+\s*=\s*\{)(\([^)]*\)|\(\))\s*=\s*className="hover-gradient-border"\s*>\s*', r'\1\2 => ', text)

    # Add the shared hover class to interactive tags that should animate
    def process_tag(match):
        full_tag = match.group(0)
        tag = match.group(1).lower()
        attrs = match.group(2)
        lower_attrs = attrs.lower()

        if 'hover-gradient-border' in attrs:
            return full_tag
        if tag in {'table', 'thead', 'tbody', 'tr', 'th', 'td'}:
            return full_tag
        if tag in {'input', 'select', 'textarea'} and re.search(r'\btype\s*=\s*["\']hidden["\']', attrs, re.I):
            return full_tag

        interactive = tag in {'button', 'a', 'input', 'select', 'textarea'}
        if not interactive:
            interactive = bool(re.search(r'\bon[a-z]+\s*=', attrs)) or bool(re.search(r'\brole\s*=\s*["\']button["\']', attrs, re.I)) or 'cursor-pointer' in lower_attrs or 'tabindex' in lower_attrs

        if not interactive:
            return full_tag

        if re.search(r'className\s*=\s*(["\'])(.*?)\1', attrs):
            return re.sub(r'(className\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)

        if re.search(r'className\s*=\s*\{`([^`]*)`\}', attrs):
            return re.sub(r'(className\s*=\s*\{`)([^`]*)(`\})', lambda m: m.group(1) + 'hover-gradient-border ' + m.group(2) + m.group(3), full_tag, count=1)

        if re.search(r'className\s*=\s*\{([^}]+)\}', attrs):
            return re.sub(r'(className\s*=\s*\{)([^}]+)(\})', lambda m: m.group(1) + '`hover-gradient-border ' + m.group(2) + '`' + m.group(3), full_tag, count=1)

        if re.search(r'class\s*=\s*(["\'])(.*?)\1', attrs):
            return re.sub(r'(class\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)

        return full_tag[:-1] + ' className="hover-gradient-border">'

    text = re.sub(r'<(button|a|input|select|textarea|div|article|section|li|span)\b([^>]*)>', process_tag, text, flags=re.I)

    if text != original:
        path.write_text(text, encoding='utf-8')
        changed.append(str(path).replace('\\', '/'))

print(f'updated {len(changed)} files')
for item in changed[:200]:
    print(item)
