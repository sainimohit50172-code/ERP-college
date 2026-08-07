from fastapi import FastAPI, APIRouter

router = APIRouter()

@router.get('/abc')
def abc():
    return {'ok': True}

app = FastAPI()
app.include_router(router, prefix='/api/v1')
print('route paths:', [route.path for route in app.routes if hasattr(route, 'path')])
