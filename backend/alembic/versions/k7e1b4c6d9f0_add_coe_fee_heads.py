"""Add COE fee heads.

Revision ID: k7e1b4c6d9f0
Revises: j6d0a3b5c7e8
"""

from alembic import op
import sqlalchemy as sa

revision = "k7e1b4c6d9f0"
down_revision = "j6d0a3b5c7e8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_fee_heads" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_fee_heads",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("fee_head_name", sa.String(160), nullable=False),
            sa.Column("fee_head_code", sa.String(64), nullable=False),
            sa.Column("receipt_head", sa.String(160), nullable=False),
            sa.Column("fee_category", sa.String(120), nullable=False),
            sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("amount_type", sa.String(32), nullable=False, server_default="Fixed"),
            sa.Column("is_refundable", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("tax_applicable", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.UniqueConstraint("fee_head_code", name="uq_coe_fee_heads_code"),
        )
        op.create_index("ix_coe_fee_heads_name", "coe_fee_heads", ["fee_head_name"])
        op.create_index("ix_coe_fee_heads_code", "coe_fee_heads", ["fee_head_code"])
        op.create_index("ix_coe_fee_heads_category", "coe_fee_heads", ["fee_category"])
        op.create_index("ix_coe_fee_heads_status", "coe_fee_heads", ["status"])


def downgrade() -> None:
    # Preserve production fee-head records during downgrade operations.
    pass
