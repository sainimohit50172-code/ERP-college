"""Add DMC student app table.

Revision ID: n5f6e7d8c9b0
Revises: m4b5c6d7e8f9
"""

from alembic import op
import sqlalchemy as sa

revision = "n5f6e7d8c9b0"
down_revision = "m4b5c6d7e8f9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "dmc_student_app" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "dmc_student_app",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("name", sa.String(160), nullable=False),
            sa.Column("prefix", sa.String(32), nullable=True),
            sa.Column("suffix", sa.String(32), nullable=True),
            sa.Column("start_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("end_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("current_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("generation_type", sa.String(32), nullable=False, server_default="Sequence"),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
        )
        op.create_index("ix_dmc_student_app_name", "dmc_student_app", ["name"])
        op.create_index("ix_dmc_student_app_status", "dmc_student_app", ["status"])
        op.create_index("ix_dmc_student_app_deleted_at", "dmc_student_app", ["deleted_at"])


def downgrade() -> None:
    # Preserve production DMC student app data during downgrade operations.
    pass
