from pathlib import Path
root = Path('src')
for path in root.rglob('*'):
    if path.is_file() and path.suffix.lower() in {'.jsx', '.tsx'}:
        text = path.read_text(encoding='utf-8')
        if 'className="hover-gradient-border">' in text:
            text = text.replace('className="hover-gradient-border">', '=>')
            path.write_text(text, encoding='utf-8')
print('repaired')
