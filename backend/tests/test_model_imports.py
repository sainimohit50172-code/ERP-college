from app.db.database import Base
from app.models import *  # noqa: F401,F403


def test_model_metadata_can_be_created():
    assert Base.metadata is not None
    assert len(Base.metadata.tables) > 0
