"""Add COE admit card preferences.

Revision ID: l8f2c5d7e0a1
Revises: k7e1b4c6d9f0
"""

from alembic import op
import sqlalchemy as sa

revision = "l8f2c5d7e0a1"
down_revision = "k7e1b4c6d9f0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_admit_card_preferences" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_admit_card_preferences",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("fee_check", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("attendance_check", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("library_check", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("feedback_check", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )


def downgrade() -> None:
    # Preserve production Admit Card preferences during downgrade operations.
    pass
