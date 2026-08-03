"""Generic Alembic script template.
Revision ID: eedf758aff7f
Revises: 46e7886742ac
Create Date: 2026-07-07 09:20:48.134820
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eedf758aff7f'
down_revision = '46e7886742ac'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    existing_columns = {column['name'] for column in sa.inspect(bind).get_columns('rooms')}

    # Application startup historically created ORM tables before Alembic ran.
    # Inspect each column so this revision also upgrades those existing databases.
    columns = (
        ('building', sa.Column('building', sa.String(length=128), nullable=True)),
        ('floor', sa.Column('floor', sa.String(length=32), nullable=True)),
        ('has_projector', sa.Column('has_projector', sa.Boolean(), nullable=False, server_default=sa.text('0'))),
        ('has_lab', sa.Column('has_lab', sa.Boolean(), nullable=False, server_default=sa.text('0'))),
        ('has_ac', sa.Column('has_ac', sa.Boolean(), nullable=False, server_default=sa.text('0'))),
        ('status', sa.Column('status', sa.Enum('Active', 'Maintenance', 'Inactive', name='room_status'), nullable=False, server_default='Active')),
    )
    for name, column in columns:
        if name not in existing_columns:
            op.add_column('rooms', column)


def downgrade() -> None:
    # This revision is intentionally irreversible: dropping these columns would
    # delete production room metadata during a rollback.
    pass
