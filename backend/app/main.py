from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1.auth.router import router as auth_router
from app.api.v1.admissions.router import router as admissions_router
from app.api.v1.attendance.router import router as attendance_router
from app.api.v1.audit.router import router as audit_router
from app.api.v1.employees.router import router as employees_router
from app.api.v1.examinations.router import router as examinations_router
from app.api.v1.fees.router import router as fees_router
from app.api.v1.finance.router import router as finance_router
from app.api.v1.hostel.router import router as hostel_router
from app.api.v1.inventory.router import router as inventory_router
from app.api.v1.library.router import router as library_router
from app.api.v1.notifications.router import router as notifications_router
from app.api.v1.procurement.router import router as procurement_router
from app.api.v1.students.router import router as students_router
from app.api.v1.transport.router import router as transport_router
from app.api.v1.shared.exceptions import register_exception_handlers

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

register_exception_handlers(app)

app.include_router(auth_router, prefix=settings.api_v1_str)
app.include_router(admissions_router, prefix=settings.api_v1_str)
app.include_router(attendance_router, prefix=settings.api_v1_str)
app.include_router(audit_router, prefix=settings.api_v1_str)
app.include_router(employees_router, prefix=settings.api_v1_str)
app.include_router(examinations_router, prefix=settings.api_v1_str)
app.include_router(fees_router, prefix=settings.api_v1_str)
app.include_router(finance_router, prefix=settings.api_v1_str)
app.include_router(hostel_router, prefix=settings.api_v1_str)
app.include_router(inventory_router, prefix=settings.api_v1_str)
app.include_router(library_router, prefix=settings.api_v1_str)
app.include_router(notifications_router, prefix=settings.api_v1_str)
app.include_router(procurement_router, prefix=settings.api_v1_str)
app.include_router(students_router, prefix=settings.api_v1_str)
app.include_router(transport_router, prefix=settings.api_v1_str)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.app_name}


@app.get("/api/v1/health")
async def health_check_v1():
    return {"status": "ok", "service": settings.app_name, "version": settings.app_version}


@app.on_event("startup")
async def startup_event():
    logger.info("Starting %s", settings.app_name)
    try:
        Base.metadata.create_all(bind=engine)
    except SQLAlchemyError as exc:
        logger.warning("Database initialization skipped: %s", exc)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down %s", settings.app_name)
