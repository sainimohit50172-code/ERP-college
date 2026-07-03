from pathlib import Path
path = Path('app/main.py')
lines = path.read_text().splitlines()
for idx, line in enumerate(lines, start=1):
    if 'startup_event' in line or 'create_all' in line or 'Database initialization skipped' in line:
        print(f'{idx}: {line}')
