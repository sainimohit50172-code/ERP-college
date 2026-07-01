# College ERP Backend Foundation

This backend scaffold provides the initial FastAPI infrastructure for the ERP application without implementing business logic or CRUD endpoints.

## Structure

- app/api/v1: API version namespace
- app/core: configuration, logging, security
- app/db: SQLAlchemy engine, session, base models
- app/models, app/schemas, app/repositories, app/services: reserved for future implementation
- app/auth, app/middleware, app/permissions, app/audit, app/notifications, app/reports, app/uploads, app/utils, app/dependencies: reserved for future implementation

## Running locally

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Docker

```bash
docker compose up --build
```
