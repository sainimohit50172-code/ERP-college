from pathlib import Path
root = Path('src')
for path in root.rglob('*'):
    if not path.is_file() or path.suffix.lower() not in {'.jsx', '.tsx'}:
        continue
    text = path.read_text(encoding='utf-8')
    if 'onClick={() = className="hover-gradient-border">' in text or 'onChange={(event) = className="hover-gradient-border">' in text or 'onChange={(e) = className="hover-gradient-border">' in text or 'onClick={() = className="hover-gradient-border">' in text:
        print(path)
