from pathlib import Path
root = Path('src')
replacements = [
    ('={() = className="hover-gradient-border">', '={() =>'),
    ('onChange={() = className="hover-gradient-border">', 'onChange={() =>'),
    ('onClick={() = className="hover-gradient-border">', 'onClick={() =>'),
]
count = 0
for path in root.rglob('*'):
    if path.is_file() and path.suffix.lower() in {'.jsx', '.tsx'}:
        text = path.read_text(encoding='utf-8')
        new_text = text
        for old, new in replacements:
            new_text = new_text.replace(old, new)
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            count += 1
print('repaired', count)
