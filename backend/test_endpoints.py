"""
Run API smoke tests using FastAPI TestClient (no server required).
Run: python backend/test_endpoints.py
"""
from importlib import import_module


ENDPOINTS = [
    "/health",
    "/api/health",
    "/api/v1/health",
    "/api/v1/auth/login",
    "/api/v1/coe/manage-bundles",
    "/api/v1/coe/exam-shifts",
    "/api/v1/coe/dmc-number-setup",
    "/api/v1/coe/dmc-student-app",
    "/api/v1/coe/dmc-student-app/global",
    "/api/v1/coe/exam-form-preferences/settings",
    "/api/v1/coe/admit-card-preferences",
]


def main():
    try:
        mod = import_module('app.main')
    except Exception as e:
        print('ERROR: failed to import app.main:', e)
        return
    app = getattr(mod, 'app', None)
    if app is None:
        print('ERROR: app not found in app.main')
        return

    # Use TestClient to call endpoints directly
    try:
        from fastapi.testclient import TestClient
    except Exception as e:
        print('Install fastapi[testclient] to run this script:', e)
        return

    client = TestClient(app)
    for ep in ENDPOINTS:
        try:
            resp = client.get(ep)
            print(f"{ep} -> {resp.status_code}")
        except Exception as e:
            print(f"{ep} -> ERROR: {e}")


if __name__ == '__main__':
    main()
