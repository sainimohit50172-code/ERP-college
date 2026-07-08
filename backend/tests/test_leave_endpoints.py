from sqlalchemy.orm import Session

from app.api.v1.leave.router import seed_default_leave_types
from app.db.database import engine
from app.models.employees.models import LeaveType


def test_seed_default_leave_types_creates_defaults():
    session = Session(bind=engine)
    try:
        session.query(LeaveType).delete()
        session.commit()

        seed_default_leave_types(session)
        session.commit()

        leave_types = session.query(LeaveType).all()
        assert len(leave_types) >= 4
        codes = {leave_type.code for leave_type in leave_types}
        assert {"annual", "sick", "casual", "maternity"}.issubset(codes)
    finally:
        session.close()
