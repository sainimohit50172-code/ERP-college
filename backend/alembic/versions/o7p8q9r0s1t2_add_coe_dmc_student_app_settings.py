"""Add COE DMC student app global settings.

Revision ID: o7p8q9r0s1t2
Revises: n5f6e7d8c9b0
"""

from alembic import op
import sqlalchemy as sa

revision = "o7p8q9r0s1t2"
down_revision = "n5f6e7d8c9b0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_dmc_student_app_settings" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_dmc_student_app_settings",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )


def downgrade() -> None:
    # Preserve production COE DMC global settings during downgrade operations.
    pass
