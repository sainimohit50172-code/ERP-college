"""Add singleton COE receipt configuration.

Revision ID: j6d0a3b5c7e8
Revises: h5c9f2a4b6d7
"""

from alembic import op
import sqlalchemy as sa

revision = "j6d0a3b5c7e8"
down_revision = "h5c9f2a4b6d7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_receipt_configuration" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_receipt_configuration",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("prefix", sa.String(32), nullable=True),
            sa.Column("receipt_number", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("suffix", sa.String(32), nullable=True),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_coe_receipt_configuration_status", "coe_receipt_configuration", ["status"])


def downgrade() -> None:
    # Preserve production receipt configuration during downgrade operations.
    pass
