from fastapi.testclient import TestClient
import app.api.v1.teachers.router as teachers_router
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

    async def update(self, entity_id, entity):
        self._items[entity_id] = entity
        return entity

    async def delete(self, entity_id):
        if entity_id not in self._items:
            return False
        del self._items[entity_id]
        return True

    async def exists(self, entity_id):
        return entity_id in self._items

    async def bulk_create(self, entities):
        created = []
        for entity in entities:
            created.append(await self.create(entity))
        return created

repository = InMemoryTeacherRepository(initial=[Teacher(id=1, employee_id=1, teacher_code='T-001')])

def override_repository():
    return repository

def override_service():
    return TeacherService(repository)

app.dependency_overrides[teachers_router.get_teacher_repository] = override_repository
app.dependency_overrides[teachers_router.get_teacher_service] = override_service

with TestClient(app) as client:
    response = client.post('/api/v1/teachers', json={'employee_id': 2, 'teacher_code': 'T-002'})
    print('status', response.status_code)
    print(response.text)
