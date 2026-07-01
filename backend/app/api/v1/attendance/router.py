from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_attendance_repository, get_attendance_service
from app.models.attendance import AttendanceRecord
from app.schemas.attendance.schemas import (
    AttendanceRecordCreate,
    AttendanceRecordDetail,
    AttendanceRecordListItem,
    AttendanceRecordUpdate,
)


class AttendanceRecordBulkUpdate(AttendanceRecordUpdate):
    id: int


router = build_crud_router(
    prefix="/attendance",
    tags=["attendance"],
    repository_dependency=get_attendance_repository,
    service_dependency=get_attendance_service,
    model_class=AttendanceRecord,
    create_schema=AttendanceRecordCreate,
    update_schema=AttendanceRecordUpdate,
    detail_schema=AttendanceRecordDetail,
    list_schema=AttendanceRecordListItem,
    bulk_update_schema=AttendanceRecordBulkUpdate,
)
