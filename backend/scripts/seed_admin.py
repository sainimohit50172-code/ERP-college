#!/usr/bin/env python
from __future__ import annotations

import sys
from pathlib import Path
from sqlalchemy import or_, select

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT_DIR / ".env")
except ImportError:
    pass

from app.core.security import get_password_hash
from app.db.database import SessionLocal
from app.models.auth import Role, User, UserRole
from sqlalchemy.orm import configure_mappers

# Import all models so SQLAlchemy can configure mappers for relationships
import app.models as _all_models  # noqa: F401

# Ensure mappers are configured before creating sessions
configure_mappers()


ADMIN_USERNAME = "admin"
ADMIN_EMAIL = "admin@collegeerp.local"
ADMIN_PASSWORD = "Admin@123"
ADMIN_ROLE_NAME = "Administrator"


def main() -> int:
    session = SessionLocal()
    try:
        admin_user = session.scalars(
            select(User).where(
                or_(User.email == ADMIN_EMAIL, User.username == ADMIN_USERNAME)
            )
        ).first()

        admin_role = session.scalars(select(Role).where(Role.name == ADMIN_ROLE_NAME)).first()
        if admin_role is None:
            admin_role = Role(
                name=ADMIN_ROLE_NAME,
                description="Default administrator role",
                is_builtin=True,
            )
            session.add(admin_role)
            session.flush()
            print(f"Created role: {ADMIN_ROLE_NAME}")

        if admin_user is not None:
            existing_role = session.scalars(
                select(UserRole).where(
                    UserRole.user_id == admin_user.id,
                    UserRole.role_id == admin_role.id,
                )
            ).first()
            if existing_role is None:
                session.add(UserRole(user_id=admin_user.id, role_id=admin_role.id))
                session.commit()
                print(f"Existing user '{ADMIN_USERNAME}' found. Assigned '{ADMIN_ROLE_NAME}' role.")
            else:
                print(f"Admin user already exists with username '{ADMIN_USERNAME}' and role '{ADMIN_ROLE_NAME}'. No changes made.")
            return 0

        hashed_password = get_password_hash(ADMIN_PASSWORD)
        admin_user = User(
            email=ADMIN_EMAIL,
            username=ADMIN_USERNAME,
            hashed_password=hashed_password,
            full_name="Administrator",
            is_active=True,
            is_superuser=True,
        )
        session.add(admin_user)
        session.flush()

        session.add(UserRole(user_id=admin_user.id, role_id=admin_role.id))
        session.commit()

        print("Admin user seeded successfully.")
        print(f"Username: {ADMIN_USERNAME}")
        print(f"Email: {ADMIN_EMAIL}")
        print(f"Role: {ADMIN_ROLE_NAME}")
        return 0
    except Exception as exc:
        session.rollback()
        print(f"Failed to seed admin user: {exc}")
        return 1
    finally:
        session.close()


if __name__ == "__main__":
    raise SystemExit(main())
