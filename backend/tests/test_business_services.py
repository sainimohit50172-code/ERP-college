import asyncio

import pytest

from app.schemas.auth.schemas import RegisterRequest
from app.services.auth.service import AuthService, AuthServiceError
from app.services.students.service import StudentService, StudentServiceError
from app.services.attendance.service import AttendanceService, AttendanceServiceError


class DummyAuthRepository:
    def __init__(self, user=None):
        self.user = user
        self.created_user = None
        self.assigned_roles = []
        self.auth_state = {"failed_attempts": 0, "locked_until": None}

    async def get_by_email(self, email):
        return self.user if self.user and self.user.email == email else None

    async def get_by_username(self, username):
        return self.user if self.user and self.user.username == username else None

    async def authenticate(self, email, password):
        if self.user and self.user.email == email and password == "secret":
            return self.user
        return None

    async def create_user(self, payload):
        self.created_user = payload
        return payload

    async def assign_role(self, user_id, role_name):
        self.assigned_roles.append(role_name)
        return True

    async def update_login_state(self, user_id, failed_attempts, locked_until):
        self.auth_state = {"failed_attempts": failed_attempts, "locked_until": locked_until}
        return True

    async def get_login_state(self, user_id):
        return self.auth_state

    async def change_password(self, user_id, new_password):
        return True

    async def get_by_id(self, entity_id):
        return self.user

    async def get_all(self):
        return [self.user] if self.user else []

    async def search(self, query):
        return []

    async def create(self, entity):
        return entity

    async def update(self, entity_id, entity):
        return entity

    async def delete(self, entity_id):
        return True

    async def exists(self, entity_id):
        return self.user is not None

    async def count(self):
        return 1 if self.user else 0

    async def paginate(self, page, page_size):
        return ([self.user] if self.user else [], 1 if self.user else 0)

    async def bulk_create(self, entities):
        return entities

    async def bulk_update(self, entities):
        return entities

    async def bulk_delete(self, entity_ids):
        return len(entity_ids)


class DummyStudentRepository:
    def __init__(self, existing=None):
        self.existing = existing

    async def find_by_roll_number(self, roll_number):
        return self.existing

    async def find_by_admission_no(self, admission_no):
        return self.existing

    async def find_by_email(self, email):
        return self.existing

    async def get_by_id(self, entity_id):
        return self.existing

    async def get_all(self):
        return []

    async def search(self, query):
        return []

    async def create(self, entity):
        return entity

    async def update(self, entity_id, entity):
        return entity

    async def delete(self, entity_id):
        return True

    async def exists(self, entity_id):
        return self.existing is not None

    async def count(self):
        return 1 if self.existing else 0

    async def paginate(self, page, page_size):
        return ([], 0)

    async def bulk_create(self, entities):
        return entities

    async def bulk_update(self, entities):
        return entities

    async def bulk_delete(self, entity_ids):
        return len(entity_ids)


class DummyAttendanceRepository:
    async def mark_attendance(self, student_id, date_value, status):
        return {"student_id": student_id, "date": date_value, "status": status}

    async def get_attendance_summary(self, student_id):
        return {"present": 1, "absent": 0, "late": 0}

    async def get_by_id(self, entity_id):
        return None

    async def get_all(self):
        return []

    async def search(self, query):
        return []

    async def create(self, entity):
        return entity

    async def update(self, entity_id, entity):
        return entity

    async def delete(self, entity_id):
        return True

    async def exists(self, entity_id):
        return False

    async def count(self):
        return 0

    async def paginate(self, page, page_size):
        return ([], 0)

    async def bulk_create(self, entities):
        return entities

    async def bulk_update(self, entities):
        return entities

    async def bulk_delete(self, entity_ids):
        return len(entity_ids)


def test_auth_service_returns_dto_for_valid_credentials():
    user = type("User", (), {"id": 1, "email": "student@example.com", "username": "student"})()
    service = AuthService(DummyAuthRepository(user))

    result = asyncio.run(service.authenticate_user("student@example.com", "secret"))

    assert result.email == "student@example.com"
    assert result.username == "student"


def test_student_service_raises_for_duplicate_admission():
    existing = type("Student", (), {"id": 1, "admission_no": "A-100"})()
    service = StudentService(DummyStudentRepository(existing))

    with pytest.raises(StudentServiceError):
        asyncio.run(
            service.enroll_student(
                admission_number="A-100",
                first_name="Asha",
                last_name="Patel",
                status="Active",
            )
        )


def test_attendance_service_returns_summary_dto():
    service = AttendanceService(DummyAttendanceRepository())

    result = asyncio.run(service.get_attendance_summary(7))

    assert result.present == 1
    assert result.absent == 0


def test_register_user_hashes_password_and_assigns_role():
    service = AuthService(DummyAuthRepository())

    result = asyncio.run(
        service.register_user(
            email="new.user@example.com",
            username="new.user",
            password="StrongPass123!",
            full_name="New User",
            role_name="Admin",
        )
    )

    assert result["user"]["email"] == "new.user@example.com"
    assert result["user"]["role"] == "Admin"
    assert result["user"]["hashed_password"] != "StrongPass123!"
    assert "Admin" in service._auth_repository.assigned_roles


def test_register_user_accepts_simple_passwords_for_ui_flow():
    service = AuthService(DummyAuthRepository())

    result = asyncio.run(
        service.register_user(
            email="ui.user@example.com",
            username="ui.user",
            password="Simple123",
            full_name="UI User",
            role_name="Admin",
        )
    )

    assert result["user"]["email"] == "ui.user@example.com"
    assert result["user"]["role"] == "Admin"


def test_register_request_accepts_camel_case_aliases():
    payload = RegisterRequest(fullName="Demo User", username="demo", email="demo@example.com", password="Simple123", role="Admin")

    assert payload.full_name == "Demo User"
    assert payload.role_name == "Admin"
