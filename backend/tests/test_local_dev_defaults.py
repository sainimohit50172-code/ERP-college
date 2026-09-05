from app.core.config import Settings


def test_local_dev_defaults_to_sqlite():
    settings = Settings()
    assert settings.use_sqlite is True
