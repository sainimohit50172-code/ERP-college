import sys
from fastapi.testclient import TestClient

sys.path.insert(0, "d:/Users/pop/Desktop/new pr/backend")

from app.main import app
from app.api.v1.shared.dependencies import (
    get_department_repository,
    get_designation_repository,
    get_academic_year_repository,
    get_semester_repository,
    get_course_repository,
    get_subject_repository,
    get_academic_class_repository,
    get_section_repository,
    get_academic_service,
)


class MockRepo:
    def __init__(self):
        self._data = {}
        self._next = 1
        self.calls = []

    async def paginate(self, page, page_size):
        items = list(self._data.values())
        total = len(items)
        return items[(page - 1) * page_size : page * page_size], total

    async def create(self, entity):
        # return a plain dict to match Pydantic expectations
        payload = {k: v for k, v in entity.__dict__.items() if not k.startswith('_')}
        eid = self._next
        self._next += 1
        payload['id'] = eid
        self._data[eid] = payload
        self.calls.append(('create', payload))
        return payload

    async def get_by_id(self, entity_id):
        self.calls.append(('get_by_id', entity_id))
        return self._data.get(entity_id)

    async def delete(self, entity_id):
        self.calls.append(('delete', entity_id))
        return self._data.pop(entity_id, None) is not None

    async def get_all(self):
        return list(self._data.values())

    async def search(self, query):
        return [v for v in self._data.values() if query.lower() in str(v.__dict__).lower()]

    async def bulk_create(self, entities):
        created = []
        for ent in entities:
            payload = {k: v for k, v in ent.__dict__.items() if not k.startswith('_')}
            payload['id'] = self._next
            self._next += 1
            self._data[payload['id']] = payload
            created.append(payload)
        return created

    async def bulk_delete(self, ids):
        deleted = 0
        for i in ids:
            if self._data.pop(i, None) is not None:
                deleted += 1
        return deleted

    async def _commit(self):
        return

    async def _refresh(self, obj):
        return


class DummyService:
    def __init__(self, repo):
        self.repo = repo


def run_tests():
    resources = [
        ("/api/v1/departments", get_department_repository),
        ("/api/v1/designations", get_designation_repository),
        ("/api/v1/academic-years", get_academic_year_repository),
        ("/api/v1/semesters", get_semester_repository),
        ("/api/v1/courses", get_course_repository),
        ("/api/v1/subjects", get_subject_repository),
        ("/api/v1/classes", get_academic_class_repository),
        ("/api/v1/sections", get_section_repository),
    ]

    repos = {}
    for base, dep in resources:
        repo = MockRepo()
        repos[base] = repo
        app.dependency_overrides[dep] = (lambda r=repo: r)

    # provide an academic service (not used heavily by generic CRUD)
    app.dependency_overrides[get_academic_service] = lambda: DummyService(None)

    client = TestClient(app)

    for base, dep in resources:
        print('Testing', base)
        repo = repos[base]
        # create
        resp = client.post(base + "/", json={"name": "Test Item"})
        print('POST', base, resp.status_code)
        assert resp.status_code == 201
        created = resp.json()["data"]
        eid = created["id"]

        # list
        resp = client.get(base + "/")
        print('LIST', base, resp.status_code)
        assert resp.status_code == 200

        # get by id
        resp = client.get(f"{base}/{eid}")
        print('GET id', base, resp.status_code, resp.text)
        if resp.status_code != 200:
            print('Repo calls so far:', repo.calls)
        assert resp.status_code == 200

        # put
        resp = client.put(f"{base}/{eid}", json={"name": "Updated"})
        print('PUT', base, resp.status_code)
        assert resp.status_code == 200

        # delete
        resp = client.delete(f"{base}/{eid}")
        print('DELETE', base, resp.status_code)
        assert resp.status_code == 204

        # validation
        resp = client.post(base + "/", json={})
        print('POST invalid', base, resp.status_code)
        assert resp.status_code in (400, 422)

    for base, repo in repos.items():
        print(base, 'calls:', repo.calls)


if __name__ == '__main__':
    run_tests()
