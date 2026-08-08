from app.main import app

match = app.router.matches('POST', '/api/v1/teachers')
print('match 1:', match)
match2 = app.router.matches('POST', '/api/v1/teachers/')
print('match 2:', match2)
