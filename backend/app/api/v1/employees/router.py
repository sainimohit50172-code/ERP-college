from app.api.v1.shared.router_factory import build_crud_router
from app.api.v1.shared.dependencies import get_employee_repository, get_employee_service
from app.models.employees import Employee
from app.schemas.employees.schemas import EmployeeCreate, EmployeeDetail, EmployeeListItem, EmployeeUpdate


class EmployeeBulkUpdate(EmployeeUpdate):
    id: int


router = build_crud_router(
    prefix="/employees",
    tags=["employees"],
    repository_dependency=get_employee_repository,
    service_dependency=get_employee_service,
    model_class=Employee,
    create_schema=EmployeeCreate,
    update_schema=EmployeeUpdate,
    detail_schema=EmployeeDetail,
    list_schema=EmployeeListItem,
    bulk_update_schema=EmployeeBulkUpdate,
)
