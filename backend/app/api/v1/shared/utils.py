from typing import Any

from sqlalchemy.exc import NoInspectionAvailable
from sqlalchemy.orm import class_mapper

from app.schemas.shared.base import FilterRequest


def _is_relationship_attribute(entity: Any, key: str) -> bool:
    try:
        mapper = class_mapper(entity if isinstance(entity, type) else entity.__class__)
        return key in mapper.relationships
    except (AttributeError, NoInspectionAvailable):
        return False


def apply_patch(entity: Any, patch_data: dict[str, Any]) -> Any:
    for key, value in patch_data.items():
        if hasattr(entity, key) and not _is_relationship_attribute(entity, key):
            setattr(entity, key, value)
    return entity


def filter_items(items: list[Any], filter_request: FilterRequest) -> list[Any]:
    results: list[Any] = []
    for item in items:
        if not hasattr(item, filter_request.field):
            continue
        value = getattr(item, filter_request.field)
        target = filter_request.value
        operator = filter_request.operator
        if operator == "eq" and value == target:
            results.append(item)
        elif operator == "ne" and value != target:
            results.append(item)
        elif operator == "gt" and value is not None and value > target:
            results.append(item)
        elif operator == "gte" and value is not None and value >= target:
            results.append(item)
        elif operator == "lt" and value is not None and value < target:
            results.append(item)
        elif operator == "lte" and value is not None and value <= target:
            results.append(item)
        elif operator == "in" and value is not None and target in value:
            results.append(item)
        elif operator == "contains" and value is not None and isinstance(value, str) and str(target) in value:
            results.append(item)
    return results
