from fastapi.testclient import TestClient
from app.main import app

routes = [
    ("GET", "/api/teachers"),
    ("GET", "/api/v1/teachers"),
    ("POST", "/api/teachers/import"),
    ("POST", "/api/v1/teachers/import"),
]

print("FastAPI route verification using TestClient")
print("This is the correct validation method for actual application routing.")

with TestClient(app) as client:
    for method, path in routes:
        if method == "GET":
            response = client.get(path)
        else:
            response = client.post(
                path,
                files={"file": ("teachers.csv", "employee_id,teacher_code\n2,T-002\n", "text/csv")},
            )
        status = response.status_code
        result = "OK" if status != 404 else "NOT FOUND"
        print(f"{method} {path} -> {status} {result}")
