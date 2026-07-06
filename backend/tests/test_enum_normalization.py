from app.db.types import CaseInsensitiveEnum


def test_case_insensitive_enum_normalizes_lowercase_values() -> None:
    enum_type = CaseInsensitiveEnum("Active", "Resigned", "Retired")

    assert enum_type.process_bind_param("active", None) == "Active"
    assert enum_type.process_result_value("active", None) == "Active"
    assert enum_type.process_bind_param("resigned", None) == "Resigned"
