from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1.exam_calendar.router import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)


def test_exam_calendar_create_rejects_invalid_dates_and_duplicates():
    invalid_payload = {
        "examName": "Mid Term",
        "academicSession": "2025-26",
        "examType": "Mid Term",
        "startDate": "2025-04-05",
        "endDate": "2025-04-01",
    }
    response = client.post("/exam-calendars/", json=invalid_payload)
    assert response.status_code == 422

    first_payload = {
        "examName": "Semester End",
        "academicSession": "2025-26",
        "examType": "Semester",
        "startDate": "2025-04-01",
        "endDate": "2025-04-05",
    }
    first_response = client.post("/exam-calendars/", json=first_payload)
    assert first_response.status_code == 201

    duplicate_response = client.post("/exam-calendars/", json=first_payload)
    assert duplicate_response.status_code == 409


def test_exam_calendar_bulk_actions_filters_exports_and_permissions():
    payload = {
        "examName": "Practical Exam",
        "academicSession": "2026-27",
        "examType": "Practical",
        "examCategory": "Internal",
        "status": "Upcoming",
        "startDate": "2026-05-01",
        "endDate": "2026-05-03",
        "createdBy": "admin"
    }
    created = client.post("/exam-calendars/", json=payload, headers={"X-User-Role": "COE", "X-Permission": "create"})
    assert created.status_code == 201
    exam_id = created.json()["data"]["id"]

    updated = client.patch(
        f"/exam-calendars/{exam_id}",
        json={"status": "Ongoing", "updatedBy": "coe"},
        headers={"X-User-Role": "COE", "X-Permission": "edit"},
    )
    assert updated.status_code == 200

    filtered = client.get(
        "/exam-calendars/",
        params={"academic_session": "2026-27", "exam_type": "Practical", "status": "Ongoing", "created_by": "admin"},
    )
    assert filtered.status_code == 200
    assert filtered.json()["data"]["total"] >= 1

    bulk_delete = client.post(
        "/exam-calendars/bulk-delete",
        json={"ids": [exam_id], "reason": "cleanup"},
        headers={"X-User-Role": "COE", "X-Permission": "delete"},
    )
    assert bulk_delete.status_code == 200
    assert bulk_delete.json()["data"]["success_count"] == 1

    audit = client.get("/exam-calendars/audit")
    assert audit.status_code == 200
    assert audit.json()["data"]["total"] >= 1

    csv_export = client.get("/exam-calendars/export", params={"format": "csv"})
    assert csv_export.status_code == 200
    assert "exam_name" in csv_export.text.lower()

    denied = client.post(
        "/exam-calendars/",
        json={"examName": "Denied", "academicSession": "2026-27", "examType": "Theory"},
        headers={"X-User-Role": "Student", "X-Permission": "create"},
    )
    assert denied.status_code == 403

    stats = client.get("/exam-calendars/stats")
    assert stats.status_code == 200
    assert "totalExams" in stats.json()["data"]
