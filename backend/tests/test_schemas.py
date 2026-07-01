from app.schemas import (
    APIResponse,
    BulkOperationRequest,
    ChangePasswordRequest,
    CurrentUser,
    FilterRequest,
    LoginRequest,
    LoginResponse,
    PaginationRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    SearchRequest,
    SortRequest,
    StudentCreate,
    StudentDetail,
    UserCreate,
    UserDetail,
)


def test_schema_package_imports_and_instantiation():
    assert APIResponse(success=True, message="ok").success is True
    assert PaginationRequest().page_size == 10
    assert LoginRequest(email="user@example.com", password="secret123").email == "user@example.com"
    assert ChangePasswordRequest(current_password="oldpass12", new_password="new12345").new_password == "new12345"
    assert CurrentUser(id=1, email="user@example.com", username="user").id == 1
    assert StudentCreate(admission_number="S-001", first_name="Jane", last_name="Doe").first_name == "Jane"
    assert StudentDetail(id=1, admission_number="S-001", first_name="Jane", last_name="Doe").id == 1
    assert UserCreate(email="user@example.com", username="user", password="Secret123").username == "user"
    assert UserDetail(id=1, email="user@example.com", username="user", password="Secret123").email == "user@example.com"
    assert BulkOperationRequest(ids=[1, 2], operation="delete").operation == "delete"
    assert FilterRequest(field="status", value="Active").field == "status"
    assert SortRequest(field="created_at", direction="desc").direction == "desc"
    assert SearchRequest(query="student").query == "student"
    assert RefreshTokenRequest(refresh_token="abc").refresh_token == "abc"
    assert PasswordResetRequest(email="user@example.com").email == "user@example.com"
