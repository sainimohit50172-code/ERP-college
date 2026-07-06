from __future__ import annotations

from typing import Any

from sqlalchemy import Enum


class CaseInsensitiveEnum(Enum):
    """Enum type that normalizes incoming values to the canonical enum member."""

    def _normalize_value(self, value: Any) -> str | None:
        if value is None:
            return None
        normalized = str(value).strip()
        if not normalized:
            return None
        for allowed in self.enums:
            if isinstance(allowed, str) and allowed.lower() == normalized.lower():
                return allowed
        return normalized

    def process_bind_param(self, value: Any, dialect) -> str | None:
        return self._normalize_value(value)

    def process_result_value(self, value: Any, dialect) -> str | None:
        return self._normalize_value(value)

    def _object_value_for_elem(self, elem: Any) -> Any:
        try:
            return super()._object_value_for_elem(elem)
        except LookupError:
            if elem is None:
                return None
            normalized = str(elem).strip()
            for allowed in self.enums:
                if isinstance(allowed, str) and allowed.lower() == normalized.lower():
                    return allowed
            raise
