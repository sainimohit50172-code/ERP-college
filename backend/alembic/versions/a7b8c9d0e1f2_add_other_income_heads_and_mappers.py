"""Add other income heads and account mappers.

Revision ID: a7b8c9d0e1f2
Revises: z1y2x3w4v5u6
"""

from alembic import op
import sqlalchemy as sa

revision = "a7b8c9d0e1f2"
down_revision = "z1y2x3w4v5u6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    
    # Create other_income_heads table
    if "other_income_heads" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "other_income_heads",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(255), nullable=False, unique=True),
            sa.Column("code", sa.String(64), nullable=False, unique=True),
            sa.Column("status", sa.String(50), nullable=False, server_default="Active"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_other_income_heads_name", "other_income_heads", ["name"])
        op.create_index("ix_other_income_heads_code", "other_income_heads", ["code"])
        op.create_index("ix_other_income_heads_status", "other_income_heads", ["status"])
    
    # Create other_income_account_mappers table
    if "other_income_account_mappers" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "other_income_account_mappers",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("other_income_head_id", sa.BigInteger(), sa.ForeignKey("other_income_heads.id"), nullable=False),
            sa.Column("account_name", sa.String(255), nullable=False),
            sa.Column("account_code", sa.String(64), nullable=False),
            sa.Column("status", sa.String(50), nullable=False, server_default="Active"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
        op.create_index("ix_other_income_account_mappers_head_id", "other_income_account_mappers", ["other_income_head_id"])
        op.create_index("ix_other_income_account_mappers_status", "other_income_account_mappers", ["status"])


def downgrade() -> None:
    # Preserve production other income account mapper records during downgrade operations.
    pass
