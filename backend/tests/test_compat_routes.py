from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1.compat.router import router


app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_compat_routes_return_paginated_lists():
    for path in ["/leads/", "/timetables/", "/lecture-notes/", "/syllabi/"]:
        response = client.get(path)
        assert response.status_code == 200, path
        payload = response.json()
        assert payload["data"]["items"] is not None, path
        assert payload["data"]["total"] >= 0, path
