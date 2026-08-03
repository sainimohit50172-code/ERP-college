from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func

from app.api.v1.auth.router import router as auth_router
from app.api.v1.admissions.router import router as admissions_router
from app.api.v1.attendance.router import router as attendance_router
from app.api.v1.coe.router import router as coe_router
from app.api.v1.audit.router import router as audit_router
from app.api.v1.employees.router import router as employees_router
from app.api.v1.leave.router import router as leave_router
from app.api.v1.examinations.router import router as examinations_router
from app.api.v1.exam_calendar.router import router as exam_calendar_router
from app.api.v1.exam_fee_setup.router import router as exam_fee_setup_router
from app.api.v1.exam_form_preferences.router import router as exam_form_preferences_router
from app.api.v1.fees.router import router as fees_router
from app.api.v1.finance.router import router as finance_router
from app.api.v1.hostel.router import router as hostel_router
from app.api.v1.helpdesk.router import router as helpdesk_router
from app.api.v1.inventory.router import router as inventory_router
from app.api.v1.library.router import router as library_router
from app.api.v1.notifications.router import router as notifications_router
from app.api.v1.procurement.router import router as procurement_router
from app.api.v1.students.router import router as students_router
from app.api.v1.certificates.router import router as certificates_router
from app.api.v1.transport.router import router as transport_router
from app.api.v1.academic.router import router as academic_router
from app.api.v1.teachers.router import router as teachers_router
from app.api.v1.compat.router import router as compat_router
from app.api.v1.shared.exceptions import register_exception_handlers

import os
from app.core.config import get_settings
from app.core.logging import logger
from app.db.database import Base, engine


def initialize_database() -> None:
    """Create the schema on startup when the database is reachable."""
    Base.metadata.create_all(bind=engine)


def create_default_admin() -> None:
    """Create default admin user if users table is empty."""
    from sqlalchemy.orm import sessionmaker
    from app.models.auth import User, Role, UserRole
    from app.core.security import get_password_hash
    
    try:
        # Create a session
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Check if users table is empty
        user_count = db.query(func.count(User.id)).scalar()
        
        if user_count == 0:
            logger.info("Creating default admin user...")
            
            # Create admin role if it doesn't exist
            admin_role = db.query(Role).filter(Role.name == "Admin").first()
            if not admin_role:
                admin_role = Role(name="Admin", description="Administrator", is_builtin=True)
                db.add(admin_role)
                db.flush()
            
            # Create admin user
            admin_user = User(
                email="admin@collegeerp.local",
                username="admin",
                hashed_password=get_password_hash("Admin@123"),
                full_name="System Administrator",
                is_active=True,
                is_superuser=True,
            )
            db.add(admin_user)
            db.flush()
            
            # Assign Admin role to user
            user_role = UserRole(user_id=admin_user.id, role_id=admin_role.id)
            db.add(user_role)
            
            db.commit()
            logger.info("Default admin user created: admin@example.com (username: admin)")
        else:
            logger.info("Users table is not empty, skipping default admin creation")
        
        db.close()
    except Exception as exc:
        logger.error("Failed to create default admin: %s", exc)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.app_debug,
    openapi_url=f"{settings.api_v1_str}/openapi.json",
)

# Determine whether to enable a permissive origin regex for Vercel-hosted frontends.
vercel_allow_regex = None
# Only enable a permissive vercel wildcard regex when explicitly requested via env var.
# This avoids guessing or hardcoding domains. Set VERCEL_ALLOW_WILDCARD=true in the backend env to enable.
try:
    vercel_allow = os.environ.get('VERCEL_ALLOW_WILDCARD', '')
    if isinstance(vercel_allow, str) and vercel_allow.lower() in ('1', 'true', 'yes'):
        vercel_allow_regex = r"https?://([^.]+\.)*vercel\.app"
except Exception:
    vercel_allow_regex = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=vercel_allow_regex,
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
    coe_router,
    audit_router,
    employees_router,
    leave_router,
    examinations_router,
    exam_calendar_router,
    exam_fee_setup_router,
    exam_form_preferences_router,
    fees_router,
    finance_router,
    hostel_router,
    helpdesk_router,
    inventory_router,
    library_router,
    notifications_router,
    procurement_router,
    students_router,
    certificates_router,
    transport_router,
    academic_router,
    teachers_router,
    compat_router,
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
    return {"status": "ok"}


@app.get("/api/v1/health")
async def health_check_v1():
    return {"status": "ok", "version": settings.app_version}


@app.get("/api/health")
async def health_check_api():
    return {"status": "ok", "version": settings.app_version}


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI startup event triggered")
    initialize_database()
    create_default_admin()
    logger.info("FastAPI startup complete and ready to accept requests")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down %s", settings.app_name)


if __name__ == "__main__":
    import uvicorn

    logger.info("Launching backend app on http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
