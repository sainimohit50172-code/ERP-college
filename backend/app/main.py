from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.auth.router import router as auth_router
from app.api.v1.admissions.router import router as admissions_router
from app.api.v1.attendance.router import router as attendance_router
from app.api.v1.audit.router import router as audit_router
from app.api.v1.employees.router import router as employees_router
from app.api.v1.leave.router import router as leave_router
from app.api.v1.examinations.router import router as examinations_router
from app.api.v1.fees.router import router as fees_router
from app.api.v1.finance.router import router as finance_router
from app.api.v1.hostel.router import router as hostel_router
from app.api.v1.inventory.router import router as inventory_router
from app.api.v1.library.router import router as library_router
from app.api.v1.notifications.router import router as notifications_router
from app.api.v1.procurement.router import router as procurement_router
from app.api.v1.students.router import router as students_router
from app.api.v1.certificates.router import router as certificates_router
from app.api.v1.transport.router import router as transport_router
from app.api.v1.academic.router import router as academic_router
from app.api.v1.teachers.router import router as teachers_router
from app.api.v1.shared.exceptions import register_exception_handlers

import os
from app.core.config import get_settings
from app.core.logging import logger
from app.db.database import Base, engine

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.app_debug,
    openapi_url=f"{settings.api_v1_str}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    try:
        response = await call_next(request)
    except Exception as exc:
        logger.exception("Request failed: %s %s -> %s", request.method, request.url.path, exc)
        raise
    logger.info("Completed %s %s with %s", request.method, request.url.path, response.status_code)
    return response

register_exception_handlers(app)

routers = [
    auth_router,
    admissions_router,
    attendance_router,
    audit_router,
    employees_router,
    leave_router,
    examinations_router,
    fees_router,
    finance_router,
    hostel_router,
    inventory_router,
    library_router,
    notifications_router,
    procurement_router,
    students_router,
    certificates_router,
    transport_router,
    academic_router,
    teachers_router,
]

for router in routers:
    app.include_router(router, prefix=settings.api_v1_str)
    app.include_router(router, prefix="/api")

# Mount uploads static directory so saved images can be served
from fastapi.staticfiles import StaticFiles
# Use absolute path relative to this file to avoid CWD issues
uploads_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(uploads_path, exist_ok=True)
# Avoid accessing attributes that may not exist on middleware objects
if not any(getattr(m, "path", None) == "/uploads" for m in getattr(app, "user_middleware", [])):
    app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name}


@app.get("/api/v1/health")
async def health_check_v1():
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}


@app.on_event("startup")
async def startup_event():
    logger.info("Starting %s", settings.app_name)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down %s", settings.app_name)
