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

> If MySQL is not available locally, the backend can fall back to a SQLite database in development mode. Set `USE_SQLITE=true` in `backend/.env` to enable this behavior.
>
> Ensure the frontend dev server is using `http://localhost:5174`; CORS is configured for that origin.

## Docker

When running inside Docker Compose, the backend uses service hostnames for MySQL and Redis.

```bash
docker compose up --build
```

If you run the backend locally instead of in Docker, keep the local `.env` values pointed at `127.0.0.1` and your host MySQL/Redis instances.
