from fastapi import FastAPI, APIRouter
from fastapi.testclient import TestClient

app = FastAPI()
router = APIRouter(prefix='/teachers')

@router.get('/')
async def list1():
    return {'ok': 1}

app.include_router(router)

with TestClient(app) as client:
    for path in ['/teachers', '/teachers/']:
        r = client.get(path)
        print(path, r.status_code, r.text)
