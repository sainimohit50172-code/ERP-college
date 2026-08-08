from fastapi import FastAPI, APIRouter
from fastapi.routing import APIRoute

app = FastAPI()
router = APIRouter(prefix='/teachers')

@router.get('')
async def user_list1():
    return {'ok': 1}

@router.get('/')
async def user_list2():
    return {'ok': 2}

app.include_router(router)

for route in app.router.routes:
    if isinstance(route, APIRoute):
        print(route.path, route.name)
