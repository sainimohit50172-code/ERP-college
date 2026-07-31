import re
from pathlib import Path

ROOT = Path(r'D:\Users\pop\Desktop\new pr')
SRC_DIR = ROOT / 'src'

handler_re = re.compile(r'(\b(?:onClick|onChange|onSubmit|onKeyDown|onKeyUp|onBlur|onFocus|onMouseEnter|onMouseLeave|onSelect)\s*=\s*\{)(\([^)]*\)|\(\))\s*=\s*className="hover-gradient-border"\s*>\s*', re.I)

tag_re = re.compile(r'<(?P<slash>/)?(?P<tag>[A-Za-z][A-Za-z0-9:.-]*)(?P<attrs>[^<>]*)>', re.M)
class_name_re = re.compile(r'className\s*=\s*(?:["\']([^"\']*)["\']|\{`([^`]*)`\}|\{([^}]+)\})')
class_attr_re = re.compile(r'class\s*=\s*["\']([^"\']*)["\']')

interactive_tags = {'button', 'a', 'input', 'select', 'textarea', 'label'}
card_like_tokens = ['card', 'item', 'panel', 'tile', 'widget', 'stat', 'summary', 'info', 'entry', 'module', 'chip', 'action', 'box', 'badge', 'pill', 'option']

files = sorted([p for p in SRC_DIR.rglob('*') if p.is_file() and p.suffix.lower() in {'.jsx', '.tsx'}])

for path in files:
    text = path.read_text(encoding='utf-8')
    new_text = handler_re.sub(r'\1\2 => ', text)

    def repl(match):
        slash = match.group('slash')
        if slash == '/':
            return match.group(0)
        tag = match.group('tag').lower()
        attrs = match.group('attrs')
        if tag in interactive_tags:
            return match.group(0)
        if tag in {'script', 'style', 'svg', 'path', 'img', 'meta', 'link', 'source', 'table', 'tbody', 'thead', 'tr', 'th', 'td', 'ul', 'ol', 'form', 'main'}:
            return match.group(0)
        if 'hover-gradient-border' not in attrs:
            return match.group(0)
        lower_attrs = attrs.lower()
        if 'onclick' in lower_attrs or 'onchange' in lower_attrs or 'role="button"' in lower_attrs or 'role=\'button\'' in lower_attrs or 'cursor-pointer' in lower_attrs or 'tabindex' in lower_attrs:
            return match.group(0)

        class_match = class_name_re.search(attrs)
        class_val = ''
        if class_match:
            class_val = (class_match.group(1) or class_match.group(2) or class_match.group(3) or '').lower()
        else:
            plain_class = class_attr_re.search(attrs)
            if plain_class:
                class_val = plain_class.group(1).lower()

        if any(token in class_val for token in card_like_tokens):
            return match.group(0)
        if any(token in class_val for token in ['rounded', 'shadow', 'border', 'p-', 'bg-', 'transition', 'hover:', 'overflow', 'cursor-pointer']):
            return match.group(0)

        # Remove hover class from non-interactive parent-like wrappers
        if 'hover-gradient-border' in attrs:
            if class_match:
                if class_match.group(1) is not None:
                    new_attr = attrs.replace(class_match.group(0), f'className="{class_match.group(1).replace("hover-gradient-border", "").strip()}"')
                    return f'<{tag}{new_attr}>'
                if class_match.group(2) is not None:
                    new_val = class_match.group(2).replace('hover-gradient-border', '').strip()
                    return f'<{tag}{attrs.replace(class_match.group(0), f'className={{`{new_val}`}}')}>'
            plain_class = class_attr_re.search(attrs)
            if plain_class:
                new_val = plain_class.group(1).replace('hover-gradient-border', '').strip()
                return f'<{tag}{attrs.replace(plain_class.group(0), f'class="{new_val}"')}>'
        return match.group(0)

    new_text = tag_re.sub(repl, new_text)
    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        print(f'updated {path.relative_to(ROOT)}')
