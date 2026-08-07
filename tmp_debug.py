import os
os.chdir(r'D:\Users\pop\Desktop\new pr\backend')
from fastapi import FastAPI
from app.api.v1.exam_form_preferences.router import router as exam_router, coe_router

app = FastAPI()
app.include_router(exam_router, prefix='/api/v1')
app.include_router(coe_router, prefix='/api/v1')
print('routes count', len(app.routes))
for route in app.routes:
    if getattr(route, 'path', None):
        print(route.path)
