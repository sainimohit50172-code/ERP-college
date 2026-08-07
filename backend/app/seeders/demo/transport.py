"""Seed transport routes, drivers (employees), vehicles, stops and assignments (~20 routes)."""
from __future__ import annotations

from app.seeders.utils import get_session, ensure_column_exists, engine
from app.models.transport import models as transport_models
from app.models.employees.models import Employee

TARGET = 20


def seed() -> None:
    # best-effort: models defined under app.models.transport.models
    # ensure is_demo column where applicable
    ensure_column_exists(engine, "routes", "is_demo", "BOOLEAN", default="1")

    session = get_session()
    try:
        # create drivers as employees
        drivers = []
        for i in range(TARGET):
            code = f"DRV-{1000 + i}"
            emp = session.query(Employee).filter(Employee.employee_no == code).first()
            if not emp:
                emp = Employee(employee_no=code, first_name=f"Driver{i+1}", last_name="Demo")
                setattr(emp, "is_demo", 1)
                session.add(emp)
                session.flush()
            drivers.append(emp)

        # create routes
        created = 0
        for i in range(TARGET):
            name = f"Route {i+1}"
            existing = session.query(transport_models.Route).filter(transport_models.Route.name == name).first()
            if existing:
                continue
            route = transport_models.Route(name=name, code=f"RT{i+1:03d}")
            setattr(route, "is_demo", 1)
            session.add(route)
            session.flush()
            # create stops
            for sidx in range(3):
                stop = transport_models.Stop(route_id=route.id, name=f"Stop {sidx+1} for {route.name}")
                setattr(stop, "is_demo", 1)
                session.add(stop)
            # assign driver
            driver = drivers[i % len(drivers)]
            drv = transport_models.Driver(route_id=route.id, employee_id=driver.id)
            setattr(drv, "is_demo", 1)
            session.add(drv)
            created += 1

        session.commit()
        print(f"Transport routes seeded: {created}")
    finally:
        session.close()


def validate() -> dict:
    session = get_session()
    try:
        total = session.query(transport_models.Route).count()
        return {"total_routes": total}
    finally:
        session.close()
