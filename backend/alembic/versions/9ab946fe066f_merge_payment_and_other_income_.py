"""Generic Alembic script template.
Revision ID: 9ab946fe066f
Revises: a1b2c3d4e5f6, a7b8c9d0e1f2
Create Date: 2026-08-31 17:54:48.827496
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9ab946fe066f'
down_revision = ('a1b2c3d4e5f6', 'a7b8c9d0e1f2')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
