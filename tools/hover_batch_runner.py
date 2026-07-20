import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(r'D:/Users/pop/Desktop/new pr')
SRC_DIR = ROOT / 'src'
BATCH_SIZE = 40

interactive_tags = {'button', 'a', 'input', 'select', 'textarea', 'label'}
parent_skip_tokens = ['wrapper','layout','container','page','header','footer','nav','sidebar','table','tbody','thead','tr','th','td','grid','list','row','column','col','main','section','content','menu','route','root','app']
card_like_tokens = ['card','item','panel','tile','widget','stat','summary','info','entry','module','chip','action','box','badge','pill','option']

open_tag_re = re.compile(r'<(?P<slash>/)?(?P<tag>[A-Za-z][A-Za-z0-9:.-]*)(?P<attrs>[^<>]*)>', re.M)
class_name_re = re.compile(r'className\s*=\s*(?:["\']([^"\']*)["\']|\{`([^`]*)`\}|\{([^}]+)\})')
class_attr_re = re.compile(r'class\s*=\s*["\']([^"\']*)["\']')

stats = {
    'jsx_processed': 0,
    'tsx_processed': 0,
    'files_modified': 0,
    'interactive_updated': 0,
    'parent_skipped': 0,
    'already_present': 0,
}

files = sorted([p for p in SRC_DIR.rglob('*') if p.is_file() and p.suffix.lower() in {'.jsx', '.tsx'}])
if not files:
    print('NO_FILES')
    sys.exit(0)

batches = [files[i:i+BATCH_SIZE] for i in range(0, len(files), BATCH_SIZE)]
print(f'Total files to process: {len(files)} in {len(batches)} batches')


def append_hover_class(attrs: str) -> str:
    class_match = class_name_re.search(attrs)
    if class_match:
        if class_match.group(1) is not None:
            existing = class_match.group(1).strip()
            new_value = f'{existing} hover-gradient-border'.strip()
            return attrs.replace(class_match.group(0), f'className="{new_value}"')
        if class_match.group(2) is not None:
            existing = class_match.group(2).strip()
            new_value = f'{existing} hover-gradient-border'.strip()
            return attrs.replace(class_match.group(0), f'className={{`{new_value}`}}')
        return attrs

    plain_class = class_attr_re.search(attrs)
    if plain_class:
        existing = plain_class.group(1).strip()
        new_value = f'{existing} hover-gradient-border'.strip()
        return attrs.replace(plain_class.group(0), f'class="{new_value}"')

    return attrs + ' className="hover-gradient-border"'

for batch_idx, batch in enumerate(batches, start=1):
    print(f'Processing batch {batch_idx}/{len(batches)} with {len(batch)} files')
    for path in batch:
        text = path.read_text(encoding='utf-8')
        original = text
        ext = path.suffix.lower()
        if ext == '.jsx':
            stats['jsx_processed'] += 1
        elif ext == '.tsx':
            stats['tsx_processed'] += 1

        def repl(match):
            slash = match.group('slash')
            if slash == '/':
                return match.group(0)
            tag = match.group('tag').lower()
            attrs = match.group('attrs')
            lower_attrs = attrs.lower()
            lower_class = ''
            class_match = class_name_re.search(attrs)
            if class_match:
                lower_class = (class_match.group(1) or class_match.group(2) or '').lower()
            else:
                plain_class = class_attr_re.search(attrs)
                if plain_class:
                    lower_class = plain_class.group(1).lower()

            if tag in {'script','style','svg','path','img','meta','link','source'}:
                return match.group(0)
            if tag in {'table','tbody','thead','tr','th','td','ul','ol','form','main'}:
                stats['parent_skipped'] += 1
                return match.group(0)
            if any(token in lower_class for token in parent_skip_tokens):
                stats['parent_skipped'] += 1
                return match.group(0)
            if 'hover-gradient-border' in lower_class or 'hover-gradient-border-target' in lower_class or 'no-hover-border' in lower_class:
                stats['already_present'] += 1
                return match.group(0)

            is_interactive = tag in interactive_tags
            if not is_interactive:
                is_interactive = bool(re.search(r'\bon[a-z]+\s*=', attrs)) or bool(re.search(r'\brole\s*=\s*["\']button["\']', attrs, re.I)) or 'cursor-pointer' in lower_attrs or 'tabindex' in lower_attrs
            if not is_interactive:
                if tag not in {'div','article','li','span','section'}:
                    return match.group(0)
                if not any(token in lower_class for token in card_like_tokens):
                    return match.group(0)

            new_attrs = append_hover_class(attrs)
            stats['interactive_updated'] += 1
            return f'<{tag}{new_attrs}>'

        new_text = open_tag_re.sub(repl, text)
        if new_text != original:
            path.write_text(new_text, encoding='utf-8')
            stats['files_modified'] += 1

    lint_targets = [str(p) for p in batch if p.suffix.lower() == '.jsx']
    if lint_targets:
        print('Validating batch with eslint...')
        result = subprocess.run(['npx', 'eslint', *lint_targets, '--ext', '.js,.jsx'], cwd=ROOT, capture_output=True, text=True)
        print(f'ESLint return code: {result.returncode}')
        if result.stdout:
            print(result.stdout[:2500])
        if result.stderr:
            print(result.stderr[:2500])

print('REPORT')
for k, v in stats.items():
    print(f'{k}: {v}')
print('Remaining files: 0')
