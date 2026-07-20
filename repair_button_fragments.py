from pathlib import Path
root = Path('src')
replacements = {
    '=>Save classroom</Button>': '>Save classroom</Button>',
    '=>Save event</Button>': '>Save event</Button>',
    '=>Upload</Button>': '>Upload</Button>',
    '=>Create assignment</Button>': '>Create assignment</Button>',
    '=>Save course</Button>': '>Save course</Button>',
    '=>Save department</Button>': '>Save department</Button>',
    '=>Create exam</Button>': '>Create exam</Button>',
    '=>Save attendance</Button>': '>Save attendance</Button>',
    '=>Save master</Button>': '>Save master</Button>',
    '=>Save schedule</Button>': '>Save schedule</Button>',
    '=>Save marks</Button>': '>Save marks</Button>',
    '=>Save result</Button>': '>Save result</Button>',
    '=>Save assignment</Button>': '>Save assignment</Button>',
    '=>Save lecture</Button>': '>Save lecture</Button>',
    'className={OUTLINE_BTN} =>': 'className={OUTLINE_BTN}>',
    'className={NAVY_BTN} =>': 'className={NAVY_BTN}>',
}
count = 0
for path in root.rglob('*'):
    if path.is_file() and path.suffix.lower() in {'.jsx', '.tsx'}:
        text = path.read_text(encoding='utf-8')
        new_text = text
        for old, new in replacements.items():
            new_text = new_text.replace(old, new)
        if new_text != text:
            path.write_text(new_text, encoding='utf-8')
            count += 1
print('repaired', count)
