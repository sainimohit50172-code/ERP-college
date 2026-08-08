from app.main import app

for idx, route in enumerate(app.router.routes):
    if type(route).__name__ == '_IncludedRouter':
        print('--- included router', idx)
        print('type(route).__name__ =', type(route).__name__)
        print('route.__class__ =', route.__class__)
        print('route.__dict__ =', getattr(route, '__dict__', None))
        print('dir(route) sample =', [a for a in dir(route) if not a.startswith('_')][:40])
        print('has attr router =', hasattr(route, 'router'))
        print('has attr routes =', hasattr(route, 'routes'))
        print('has attr app =', hasattr(route, 'app'))
        print('has attr endpoint =', hasattr(route, 'endpoint'))
        print('')
        break
