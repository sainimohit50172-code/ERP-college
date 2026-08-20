from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func

from app.api.v1.auth.router import router as auth_router
from app.api.v1.admissions.router import router as admissions_router, admission_categories_router
from app.api.v1.attendance.router import router as attendance_router
from app.api.v1.audit.router import router as audit_router
from app.api.v1.coe.router import router as coe_router
from app.api.v1.employees.router import router as employees_router
from app.api.v1.leave.router import (
    router as leave_router,
    leave_group_router,
    leave_cycle_router,
    leave_preference_router,
)
from app.api.v1.examinations.router import router as examinations_router
from app.api.v1.exam_calendar.router import router as exam_calendar_router
from app.api.v1.exam_fee_setup.router import (
    router as exam_fee_setup_router,
    list_fee_heads,
    search_fee_heads,
    create_fee_head,
    get_fee_head,
    update_fee_head,
    delete_fee_head,
    update_fee_head_status,
    list_fee_head_groups,
    search_fee_head_groups,
    create_fee_head_group,
    get_fee_head_group,
    update_fee_head_group,
    delete_fee_head_group,
)
from app.api.v1.exam_form_preferences.router import (
    router as exam_form_preferences_router,
    coe_router as exam_form_preferences_coe_router,
    get_coe_exam_form_preference_settings,
    update_coe_exam_form_preference_settings,
    list_coe_exam_form_preferences,
    create_coe_exam_form_preference,
    search_coe_exam_form_preferences,
    get_coe_exam_form_preference,
    update_coe_exam_form_preference,
    delete_coe_exam_form_preference,
)
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
from app.api.v1.fallback.router import router as fallback_router

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
                email="admin@example.com",
                username="admin",
                hashed_password=get_password_hash("Admin123"),
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


def register_existing_route_if_missing(app_instance, path, endpoint, methods):
    if any(getattr(route, "path", None) == path for route in app_instance.routes):
        return
    app_instance.add_api_route(path, endpoint, methods=list(methods))


def register_router_routes(app_instance, router_instance, prefix: str):
    for route in getattr(router_instance, "routes", []):
        if not getattr(route, "path", None):
            continue
        route_path = f"{prefix}{route.path}"
        route_methods = set(getattr(route, "methods", []) or [])
        if any(
            getattr(existing_route, "path", None) == route_path
            and route_methods.issubset(set(getattr(existing_route, "methods", []) or []))
            for existing_route in app_instance.routes
        ):
            continue
        app_instance.add_api_route(
            route_path,
            route.endpoint,
            methods=list(route_methods),
            name=getattr(route, "name", None),
            include_in_schema=getattr(route, "include_in_schema", True),
            status_code=getattr(route, "status_code", None),
            response_model=getattr(route, "response_model", None),
            tags=getattr(route, "tags", None),
        )


routers = [
    auth_router,
    admissions_router,
    admission_categories_router,
    attendance_router,
    audit_router,
    coe_router,
    employees_router,
    leave_router,
    examinations_router,
    exam_calendar_router,
    exam_fee_setup_router,
    exam_form_preferences_router,
    exam_form_preferences_coe_router,
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

# Register concrete leave master routes before compatibility/fallback routes.
# The fallback exposes a dynamic /{resource} path and would otherwise capture
# leave-groups requests before the real CRUD endpoints can handle them.
for leave_master_router in (leave_group_router, leave_cycle_router, leave_preference_router):
    register_router_routes(app, leave_master_router, settings.api_v1_str)
    register_router_routes(app, leave_master_router, "/api")

for router in routers:
    app.include_router(router, prefix=settings.api_v1_str)
    app.include_router(router, prefix="/api")

app.include_router(fallback_router, prefix=settings.api_v1_str)
app.include_router(fallback_router, prefix="/api")

register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/settings", get_coe_exam_form_preference_settings, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/settings", update_coe_exam_form_preference_settings, ["PUT"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences", list_coe_exam_form_preferences, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences", create_coe_exam_form_preference, ["POST"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/search", search_coe_exam_form_preferences, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/{{entity_id}}", get_coe_exam_form_preference, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/{{entity_id}}", update_coe_exam_form_preference, ["PUT"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/exam-form-preferences/{{entity_id}}", delete_coe_exam_form_preference, ["DELETE"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads", list_fee_heads, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads", create_fee_head, ["POST"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads/{{entity_id}}", get_fee_head, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads/{{entity_id}}", update_fee_head, ["PUT"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads/{{entity_id}}", delete_fee_head, ["DELETE"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads/{{entity_id}}/status", update_fee_head_status, ["PATCH"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-heads/search", search_fee_heads, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups", list_fee_head_groups, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups", create_fee_head_group, ["POST"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups/{{entity_id}}", get_fee_head_group, ["GET"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups/{{entity_id}}", update_fee_head_group, ["PUT"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups/{{entity_id}}", delete_fee_head_group, ["DELETE"])
register_existing_route_if_missing(app, f"{settings.api_v1_str}/coe/fee-head-groups/search", search_fee_head_groups, ["GET"])

register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/settings", get_coe_exam_form_preference_settings, ["GET"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/settings", update_coe_exam_form_preference_settings, ["PUT"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences", list_coe_exam_form_preferences, ["GET"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences", create_coe_exam_form_preference, ["POST"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/search", search_coe_exam_form_preferences, ["GET"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/{entity_id}", get_coe_exam_form_preference, ["GET"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/{entity_id}", update_coe_exam_form_preference, ["PUT"])
register_existing_route_if_missing(app, "/api/coe/exam-form-preferences/{entity_id}", delete_coe_exam_form_preference, ["DELETE"])
register_existing_route_if_missing(app, "/api/coe/fee-heads", list_fee_heads, ["GET"])
register_existing_route_if_missing(app, "/api/coe/fee-heads", create_fee_head, ["POST"])
register_existing_route_if_missing(app, "/api/coe/fee-heads/{entity_id}", get_fee_head, ["GET"])
register_existing_route_if_missing(app, "/api/coe/fee-heads/{entity_id}", update_fee_head, ["PUT"])
register_existing_route_if_missing(app, "/api/coe/fee-heads/{entity_id}", delete_fee_head, ["DELETE"])
register_existing_route_if_missing(app, "/api/coe/fee-heads/{entity_id}/status", update_fee_head_status, ["PATCH"])
register_existing_route_if_missing(app, "/api/coe/fee-heads/search", search_fee_heads, ["GET"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups", list_fee_head_groups, ["GET"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups", create_fee_head_group, ["POST"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups/{entity_id}", get_fee_head_group, ["GET"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups/{entity_id}", update_fee_head_group, ["PUT"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups/{entity_id}", delete_fee_head_group, ["DELETE"])
register_existing_route_if_missing(app, "/api/coe/fee-head-groups/search", search_fee_head_groups, ["GET"])

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
    initialize_database()
    create_default_admin()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down %s", settings.app_name)
