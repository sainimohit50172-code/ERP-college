"""Generic Alembic script template.
Revision ID: 46e7886742ac
Revises: 
Create Date: 2026-07-03 12:31:55.608005
"""

from alembic import op
import sqlalchemy as sa
from app.db.base import Base

import app.models  # noqa: F401


# revision identifiers, used by Alembic.
revision = '46e7886742ac'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # The original baseline was empty while application startup created the
    # ORM schema. Keep that behavior available to clean Alembic installations
    # without replacing or dropping any existing tables.
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    # The baseline owns the database schema; dropping it would destroy data.
    pass
