import os
import re
import sys
from pathlib import Path

SRC_DIR = Path('src')
BATCH_SIZE = 40

interactive_tags = set(['button','a','input','select','textarea'])
parent_skip_tokens = ['wrapper','layout','container','page','header','footer','nav','sidebar','table','tbody','thead','tr','row','col','grid','list','section']

hover_class = 'hover-gradient-border'

jsx_file_pattern = re.compile(r".*\.(jsx|tsx)$")

# Regex to find opening tag and attributes
open_tag_re = re.compile(r"<([A-Za-z0-9_:.]+)(\s+[^>]*)?>", re.M)
class_attr_re = re.compile(r'className\s*=\s*{?\s*["']([^"']*)["']\s*}?')
onclick_re = re.compile(r'onClick\s*=')
role_button_re = re.compile(r"role\s*=\s*['\"]button['\"]")
link_tag_re = re.compile(r'\b(Link|NavLink)\b')

stats = {
    'jsx_processed': 0,
    'tsx_processed': 0,
    'files_modified': 0,
    'interactive_updated': 0,
    'parent_skipped': 0,
}

files = []
for p in SRC_DIR.rglob('*'):
    if p.is_file() and jsx_file_pattern.match(str(p)):
        files.append(p)

files = sorted(files)

if not files:
    print('NO_FILES')
    sys.exit(0)

batches = [files[i:i+BATCH_SIZE] for i in range(0, len(files), BATCH_SIZE)]

print(f'Total files to process: {len(files)} in {len(batches)} batches')

for batch_idx, batch in enumerate(batches, start=1):
    print(f'Processing batch {batch_idx}/{len(batches)} with {len(batch)} files')
    for path in batch:
        text = path.read_text(encoding='utf-8')
        orig = text
        ext = path.suffix.lower()
        if ext == '.jsx':
            stats['jsx_processed'] += 1
        elif ext == '.tsx':
            stats['tsx_processed'] += 1

        modified = False

        # iterate over opening tags
        def repl(match):
            nonlocal modified
            tag = match.group(1)
            attrs = match.group(2) or ''
            tag_lower = tag.split(':')[-1]

            is_interactive = False
            if tag_lower in interactive_tags:
                is_interactive = True
            if onclick_re.search(attrs) or role_button_re.search(attrs) or link_tag_re.search(tag):
                is_interactive = True
            # classes indicate inner box
            m_class = class_attr_re.search(attrs)
            class_val = m_class.group(1) if m_class else ''
            lower_class = class_val.lower()
            # skip if class suggests parent container
            for token in parent_skip_tokens:
                if token in lower_class:
                    # count as skipped
                    stats['parent_skipped'] += 1
                    return match.group(0)

            if not is_interactive and 'card' not in lower_class and 'btn' not in lower_class and 'panel' not in lower_class and 'item' not in lower_class:
                return match.group(0)

            # if already has hover class or negation, skip
            if hover_class in class_val or 'hover-gradient-border-target' in class_val or 'no-hover-border' in class_val:
                return match.group(0)

            # add hover class
            if m_class:
                new_class = m_class.group(0).replace(m_class.group(1), (m_class.group(1) + ' ' + hover_class).strip())
                new_attrs = attrs.replace(m_class.group(0), new_class)
            else:
                # inject className
                # place before closing of attrs
                if attrs.strip() == '':
                    new_attrs = ' className="' + hover_class + '"'
                else:
                    new_attrs = attrs + ' className="' + hover_class + '"'

            modified = True
            stats['interactive_updated'] += 1
            return f'<{tag}{new_attrs}>'

        new_text = open_tag_re.sub(repl, text)

        if modified and new_text != orig:
            # backup
            backup = path.with_suffix(path.suffix + '.bak')
            if not backup.exists():
                path.rename(path.with_suffix(path.suffix + '.bak_temp'))
                # write new
                path.write_text(new_text, encoding='utf-8')
                # restore backup filename
                path.with_suffix(path.suffix + '.bak_temp').rename(backup)
            else:
                path.write_text(new_text, encoding='utf-8')
            stats['files_modified'] += 1

    # quick validation: attempt to run eslint --ext .js,.jsx on this batch files (skipped here)
    print(f'Batch {batch_idx} complete')

# final report
print('REPORT')
for k,v in stats.items():
    print(k, v)
print('Remaining files: 0')
