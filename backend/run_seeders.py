import json
from app.seeders.master.academic import seed as academic_seed
from app.seeders.master.extra import seed as extra_seed

if __name__ == '__main__':
    report = {}
    try:
        report['academic'] = academic_seed()
    except Exception as e:
        report['academic_error'] = {'type': type(e).__name__, 'message': str(e)}
    try:
        report['extra'] = extra_seed()
    except Exception as e:
        report['extra_error'] = {'type': type(e).__name__, 'message': str(e)}
    print(json.dumps(report, indent=2))