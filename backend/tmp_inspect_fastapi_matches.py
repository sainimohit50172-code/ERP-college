import inspect
import fastapi
from fastapi.routing import APIRouter, _IncludedRouter
import fastapi.routing
print('fastapi routing file:', fastapi.routing.__file__)
print('--- APIRouter.matches ---')
print(inspect.getsource(APIRouter.matches))
print('--- _IncludedRouter.matches ---')
print(inspect.getsource(_IncludedRouter.matches))
