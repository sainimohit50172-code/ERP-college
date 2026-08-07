"""Add COE fee head group details table.

Revision ID: q1w2e3r4t5y6
Revises: p1q2w3e4r5t6
"""

from alembic import op
import sqlalchemy as sa

revision = "q1w2e3r4t5y6"
down_revision = "p1q2w3e4r5t6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "coe_fee_head_group_details" not in inspector.get_table_names():
        op.create_table(
            "coe_fee_head_group_details",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("fee_head_group_id", sa.BigInteger(), sa.ForeignKey("coe_fee_head_groups.id"), nullable=False),
            sa.Column("fee_head_id", sa.BigInteger(), sa.ForeignKey("coe_fee_heads.id"), nullable=False),
            sa.Column("name", sa.String(255), nullable=False),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_coe_fee_head_group_details_group_id", "coe_fee_head_group_details", ["fee_head_group_id"])
        op.create_index("ix_coe_fee_head_group_details_fee_head_id", "coe_fee_head_group_details", ["fee_head_id"])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "coe_fee_head_group_details" in inspector.get_table_names():
        op.drop_index("ix_coe_fee_head_group_details_group_id", table_name="coe_fee_head_group_details")
        op.drop_index("ix_coe_fee_head_group_details_fee_head_id", table_name="coe_fee_head_group_details")
        op.drop_table("coe_fee_head_group_details")
