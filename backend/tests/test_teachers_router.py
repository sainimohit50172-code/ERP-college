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

    async def paginate(self, page: int, page_size: int):
        items = list(self._items.values())
        total = len(items)
        start = max((page - 1) * page_size, 0)
        end = start + page_size
        return items[start:end], total

    async def bulk_create(self, entities):
        created = []
        for entity in entities:
            created.append(await self.create(entity))
        return created


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


def test_import_teachers_csv(client):
    csv_data = "employee_id,teacher_code\n2,T-002\n3,T-003\n"
    response = client.post(
        "/api/v1/teachers/import",
        files={"file": ("teachers.csv", csv_data, "text/csv")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert len(payload["data"]) == 2
    assert payload["data"][0]["teacher_code"] == "T-002"
    assert payload["data"][1]["teacher_code"] == "T-003"


def test_teacher_import_and_list_routes_are_reachable(client):
    route_expectations = [
        ("GET", "/api/teachers", 200),
        ("GET", "/api/v1/teachers", 200),
        ("POST", "/api/teachers/import", 200),
        ("POST", "/api/v1/teachers/import", 200),
    ]

    for method, path, expected_status in route_expectations:
        if method == "GET":
            response = client.get(path)
        else:
            response = client.post(
                path,
                files={"file": ("teachers.csv", "employee_id,teacher_code\n2,T-002\n", "text/csv")},
            )

        assert response.status_code == expected_status, (
            f"Route {method} {path} should be reachable and return {expected_status}, got {response.status_code}"
        )
