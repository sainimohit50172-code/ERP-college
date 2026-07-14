import pytest
from fastapi.testclient import TestClient

from app.api.v1.students import router as students_router
from app.main import app
from app.models.students import Student
from app.services.students.service import StudentService


class InMemoryStudentRepository:
    def __init__(self, initial_students=None):
        self._items = {}
        self._counter = 1
        for student in initial_students or []:
            self._items[student.id] = student
            self._counter = max(self._counter, student.id + 1)

    async def get_by_id(self, entity_id: int):
        return self._items.get(entity_id)

    async def get_all(self):
        return list(self._items.values())

    async def search(self, query: str):
        lowered = query.lower()
        return [student for student in self._items.values() if lowered in str(student.id).lower() or lowered in (student.first_name or "").lower() or lowered in (student.last_name or "").lower()]

    async def create(self, entity):
        if entity.id is None:
            entity.id = self._counter
            self._counter += 1
        self._items[entity.id] = entity
        return entity

    async def update(self, entity_id: int, entity):
        self._items[entity_id] = entity
        return entity

    async def delete(self, entity_id: int):
        if entity_id not in self._items:
            return False
        del self._items[entity_id]
        return True

    async def exists(self, entity_id: int):
        return entity_id in self._items

    async def count(self):
        return len(self._items)

    async def paginate(self, page: int, page_size: int):
        items = list(self._items.values())
        start = (page - 1) * page_size
        end = start + page_size
        return items[start:end], len(items)

    async def bulk_create(self, entities):
        for entity in entities:
            await self.create(entity)
        return entities

    async def bulk_update(self, entities):
        for entity in entities:
            await self.update(entity.id, entity)
        return entities

    async def bulk_delete(self, entity_ids):
        deleted = 0
        for entity_id in entity_ids:
            if await self.delete(entity_id):
                deleted += 1
        return deleted

    async def find_by_roll_number(self, roll_number: str):
        return next((student for student in self._items.values() if student.admission_no == roll_number), None)

    async def find_by_admission_no(self, admission_no: str):
        return next((student for student in self._items.values() if student.admission_no == admission_no), None)

    async def find_by_email(self, email: str):
        return next((student for student in self._items.values() if (student.contact or {}).get("email") == email), None)

    async def list_students(
        self,
        page: int,
        page_size: int,
        search: str | None = None,
        filter_field: str | None = None,
        filter_value: str | None = None,
        filter_operator: str = "eq",
        sort_by: str | None = None,
        sort_order: str = "asc",
    ):
        items = list(self._items.values())

        if search:
            lowered = search.lower()
            items = [
                student
                for student in items
                if lowered in (student.admission_no or "").lower()
                or lowered in (student.first_name or "").lower()
                or lowered in (student.last_name or "").lower()
                or lowered in str((student.contact or {}).get("email", "")).lower()
                or lowered in str((student.contact or {}).get("phone", "")).lower()
            ]

        if filter_field and filter_value is not None:
            if filter_operator == "contains":
                items = [
                    student
                    for student in items
                    if filter_value.lower() in str(getattr(student, filter_field, "")).lower()
                ]
            elif filter_operator == "eq":
                items = [student for student in items if str(getattr(student, filter_field, "")) == filter_value]
            elif filter_operator == "ne":
                items = [student for student in items if str(getattr(student, filter_field, "")) != filter_value]
            elif filter_operator == "gt":
                items = [student for student in items if str(getattr(student, filter_field, "")) > filter_value]
            elif filter_operator == "gte":
                items = [student for student in items if str(getattr(student, filter_field, "")) >= filter_value]
            elif filter_operator == "lt":
                items = [student for student in items if str(getattr(student, filter_field, "")) < filter_value]
            elif filter_operator == "lte":
                items = [student for student in items if str(getattr(student, filter_field, "")) <= filter_value]

        if sort_by:
            reverse = sort_order == "desc"
            items = sorted(items, key=lambda student: str(getattr(student, sort_by, "") or "").lower(), reverse=reverse)

        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        return items[start:end], total


@pytest.fixture()
def client():
    repository = InMemoryStudentRepository(
        initial_students=[
            Student(id=1, admission_no="S-001", first_name="Jane", last_name="Doe", status="Active"),
        ]
    )

    def override_repository():
        return repository

    def override_service():
        return StudentService(repository)

    app.dependency_overrides[students_router.get_student_repository] = override_repository
    app.dependency_overrides[students_router.get_student_service] = override_service

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_list_students_returns_paginated_payload(client):
    response = client.get("/api/v1/students?page=1&page_size=10&search=Jane&sort_by=first_name&sort_order=asc")

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["total"] == 1
    assert payload["data"]["items"][0]["admission_number"] == "S-001"


def test_create_student_returns_standardized_response(client):
    response = client.post(
        "/api/v1/students",
        json={
            "admission_number": "S-002",
            "first_name": "John",
            "last_name": "Smith",
            "email": "john@example.com",
            "phone": "12345678",
            "status": "Active",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["admission_number"] == "S-002"
    assert payload["data"]["email"] == "john@example.com"


def test_update_student_updates_existing_record(client):
    response = client.put(
        "/api/v1/students/1",
        json={"first_name": "Janet", "status": "Alumni"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["data"]["first_name"] == "Janet"
    assert payload["data"]["status"] == "Alumni"


def test_delete_student_removes_existing_record(client):
    response = client.delete("/api/v1/students/1")

    assert response.status_code == 204
    assert client.get("/api/v1/students/1").status_code == 404
