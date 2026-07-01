from typing import Any

from app.schemas.shared.base import FilterRequest


def apply_patch(entity: Any, patch_data: dict[str, Any]) -> Any:
    for key, value in patch_data.items():
        if hasattr(entity, key):
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
