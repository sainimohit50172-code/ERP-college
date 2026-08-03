"""Add COE bundle management.

Revision ID: m4b5c6d7e8f9
Revises: l8f2c5d7e0a1
"""

from alembic import op
import sqlalchemy as sa

revision = "m4b5c6d7e8f9"
down_revision = "l8f2c5d7e0a1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_manage_bundles" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_manage_bundles",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("bundle_name", sa.String(160), nullable=False),
            sa.Column("bundle_code", sa.String(64), nullable=False),
            sa.Column("bundle_type", sa.String(64), nullable=False, server_default="Standard"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.UniqueConstraint("bundle_name", name="uq_coe_manage_bundles_bundle_name"),
            sa.UniqueConstraint("bundle_code", name="uq_coe_manage_bundles_bundle_code"),
        )
        op.create_index("ix_coe_manage_bundles_bundle_name", "coe_manage_bundles", ["bundle_name"])
        op.create_index("ix_coe_manage_bundles_bundle_code", "coe_manage_bundles", ["bundle_code"])
        op.create_index("ix_coe_manage_bundles_bundle_type", "coe_manage_bundles", ["bundle_type"])
        op.create_index("ix_coe_manage_bundles_status", "coe_manage_bundles", ["status"])
        op.create_index("ix_coe_manage_bundles_deleted_at", "coe_manage_bundles", ["deleted_at"])


def downgrade() -> None:
    # Preserve production bundle data during downgrade operations.
    pass
