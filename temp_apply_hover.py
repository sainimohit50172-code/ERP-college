import json
import re
from pathlib import Path

root = Path('src')
files = [p for p in root.rglob('*') if p.is_file() and p.suffix.lower() in {'.jsx', '.tsx'} and 'node_modules' not in p.parts]
files.sort()

summary = {
    'jsx_files': 0,
    'tsx_files': 0,
    'page_files': 0,
    'component_files': 0,
    'files_modified': 0,
    'buttons': 0,
    'inputs': 0,
    'selects': 0,
    'textareas': 0,
    'dashboard_cards': 0,
    'favorite_boxes': 0,
    'navigation_items': 0,
    'sidebar_items': 0,
    'interactive_components': 0,
    'modified_files': [],
}

for path in files:
    if path.suffix.lower() == '.jsx':
        summary['jsx_files'] += 1
    else:
        summary['tsx_files'] += 1

    if 'pages' in path.parts or 'Page' in path.stem or path.name.endswith('Page.jsx') or path.name.endswith('Page.tsx'):
        summary['page_files'] += 1
    else:
        summary['component_files'] += 1

    text = path.read_text(encoding='utf-8')
    original = text

    def transform_opening(match):
        full_tag = match.group(0)
        tag = match.group(1).lower()
        attrs = match.group(2)
        lower_attrs = attrs.lower()

        if 'hover-gradient-border' in attrs:
            return full_tag

        if tag in {'input', 'select', 'textarea'} and re.search(r'\btype\s*=\s*["\']hidden["\']', attrs, re.I):
            return full_tag

        is_interactive = tag in {'button', 'a', 'input', 'select', 'textarea'}
        if not is_interactive:
            is_interactive = bool(re.search(r'\bon(click|keydown|keyup|mouseenter|mouseleave|focus|blur)\s*=', attrs)) or bool(re.search(r'\brole\s*=\s*["\']button["\']', attrs, re.I)) or 'cursor-pointer' in lower_attrs or 'tabindex' in lower_attrs or 'onselect' in lower_attrs

        if not is_interactive:
            return full_tag

        if re.search(r'className\s*=\s*["\']', attrs):
            return re.sub(r'(className\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)
        if re.search(r'class\s*=\s*["\']', attrs):
            return re.sub(r'(class\s*=\s*)(["\'])([^"\']*)(\2)', lambda m: m.group(1) + m.group(2) + (m.group(3) + ' hover-gradient-border' if m.group(3).strip() else 'hover-gradient-border') + m.group(4), full_tag, count=1)
        if re.search(r'className\s*=\s*\{`', attrs):
            return re.sub(r'(className\s*=\s*\{`)([^`]*)(`\})', lambda m: m.group(1) + 'hover-gradient-border ' + m.group(2) + m.group(3), full_tag, count=1)
        if full_tag.rstrip().endswith('/>'):
            return full_tag[:-2] + ' className="hover-gradient-border" />'
        return full_tag[:-1] + ' className="hover-gradient-border">'

    text = re.sub(r'<(button|a|input|select|textarea|div|article|section|li|span)\b([^>]*)>', transform_opening, text, flags=re.I)

    def transform_self_closing(match):
        full_tag = match.group(0)
        tag = match.group(1).lower()
        attrs = match.group(2)
        lower_attrs = attrs.lower()
        if 'hover-gradient-border' in attrs:
            return full_tag
        if tag in {'input', 'select', 'textarea'} and re.search(r'\btype\s*=\s*["\']hidden["\']', attrs, re.I):
            return full_tag
        if tag not in {'input', 'select', 'textarea'}:
            return full_tag
        if re.search(r'className\s*=\s*["\']', attrs) or re.search(r'class\s*=\s*["\']', attrs):
            return full_tag
        return full_tag[:-2] + ' className="hover-gradient-border" />'

    text = re.sub(r'<(input|select|textarea)\b([^>]*)/>', transform_self_closing, text, flags=re.I)

    if text != original:
        path.write_text(text, encoding='utf-8')
        summary['files_modified'] += 1
        summary['modified_files'].append(str(path).replace('\\', '/'))

    # count updated elements by inspecting final text versus original for each category
    def count_occurrences(pattern, text_to_check):
        return len(re.findall(pattern, text_to_check))

    # Count per element type from the modified file by matching opening tags that now have hover class
    summary['buttons'] += count_occurrences(r'<button\b[^>]*className=["\'][^>]*hover-gradient-border', text)
    summary['inputs'] += count_occurrences(r'<input\b[^>]*className=["\'][^>]*hover-gradient-border', text)
    summary['selects'] += count_occurrences(r'<select\b[^>]*className=["\'][^>]*hover-gradient-border', text)
    summary['textareas'] += count_occurrences(r'<textarea\b[^>]*className=["\'][^>]*hover-gradient-border', text)

    # Count dashboard-like interactive cards
    summary['dashboard_cards'] += len(re.findall(r'<(div|article|section|li|span)\b[^>]*(?:className|class)=["\'][^>]*(?:dashboard|summary|stat|kpi|analytics|widget|quick|favorite|tile|chip|card)[^>]*hover-gradient-border', text, re.I))
    summary['favorite_boxes'] += len(re.findall(r'<(div|article|section|li|span)\b[^>]*(?:className|class)=["\'][^>]*(?:favorite|favourite)[^>]*hover-gradient-border', text, re.I))
    summary['navigation_items'] += len(re.findall(r'<(a|button|li|div|span)\b[^>]*(?:className|class)=["\'][^>]*(?:nav|menu|sidebar|navigation)[^>]*hover-gradient-border', text, re.I))
    summary['sidebar_items'] += len(re.findall(r'<(a|button|li|div|span)\b[^>]*(?:className|class)=["\'][^>]*(?:sidebar|sidenav|menu)[^>]*hover-gradient-border', text, re.I))
    summary['interactive_components'] += len(re.findall(r'<(button|a|input|select|textarea|div|article|section|li|span)\b[^>]*(?:className|class)=["\'][^>]*hover-gradient-border', text, re.I))

print('SCAN_REPORT')
print(json.dumps(summary, indent=2))
