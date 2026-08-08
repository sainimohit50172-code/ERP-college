from fastapi import FastAPI, APIRouter
from fastapi.routing import APIRoute

app = FastAPI()
router = APIRouter(prefix='/teachers')

@router.get('')
async def list1():
    return {'ok': 1}

@router.get('/')
async def list2():
    return {'ok': 2}

app.include_router(router)

print('router routes:')
for route in router.routes:
    print('  router', type(route).__name__, getattr(route,'path',None), getattr(route,'methods',None), getattr(route,'name',None))

print('app routes:')
for route in app.router.routes:
    print('  app', type(route).__name__, getattr(route,'path',None), getattr(route,'methods',None), getattr(route,'name',None))
