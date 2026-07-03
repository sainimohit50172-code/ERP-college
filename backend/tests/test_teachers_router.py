import pytest
from fastapi.testclient import TestClient

from app.api.v1.teachers import router as teachers_router
from app.main import app
from app.models.teachers import Teacher
from app.services.teachers.service import TeacherService


class InMemoryTeacherRepository:
    def __init__(self, initial=None):
        self._items = {}
        self._counter = 1
        for item in initial or []:
            self._items[item.id] = item
            self._counter = max(self._counter, item.id + 1)

    async def get_by_id(self, entity_id: int):
        return self._items.get(entity_id)

    async def get_all(self):
        return list(self._items.values())

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


@pytest.fixture()
def client():
    repository = InMemoryTeacherRepository(initial=[Teacher(id=1, employee_id=1, teacher_code="T-001")])

    def override_repository():
        return repository

    def override_service():
        return TeacherService(repository)

    app.dependency_overrides[teachers_router.get_teacher_repository] = override_repository
    app.dependency_overrides[teachers_router.get_teacher_service] = override_service

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_create_teacher_and_get(client):
    response = client.post("/api/v1/teachers", json={"employee_id": 2, "teacher_code": "T-002"})
    assert response.status_code == 201
    payload = response.json()
    assert payload["success"] is True
    assert payload["data"]["teacher_code"] == "T-002"
