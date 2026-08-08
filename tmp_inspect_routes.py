import sys
from pathlib import Path
sys.path.insert(0, str(Path(r'd:/Users/pop/Desktop/new pr/backend')))
from app.api.v1.exam_calendar.router import router
print('ROUTE_COUNT', len(router.routes))
for r in router.routes:
    print(repr(getattr(r, 'path', None)), getattr(r, 'methods', None), type(r))
