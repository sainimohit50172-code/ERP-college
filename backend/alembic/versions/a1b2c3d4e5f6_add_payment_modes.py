"""Add payment modes table.

Revision ID: a1b2c3d4e5f6
Revises: z1y2x3w4v5u6
"""

from alembic import op
import sqlalchemy as sa

revision = "a1b2c3d4e5f6"
down_revision = "z1y2x3w4v5u6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "payment_modes" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "payment_modes",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("mode_name", sa.String(100), nullable=False, unique=True),
            sa.Column("code", sa.String(64), nullable=False, unique=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("status", sa.String(20), nullable=False, server_default="Active"),
            sa.Column("activated_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )


def downgrade() -> None:
    op.drop_table("payment_modes")
