"""Merge miscellaneous remark migrations.

Revision ID: z1y2x3w4v5u6
Revises: 6457692d233d, x9y0z1a2b3c4
"""

from alembic import op
import sqlalchemy as sa

revision = "z1y2x3w4v5u6"
down_revision = ("6457692d233d", "x9y0z1a2b3c4")
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("miscellaneous_remarks")}

    if "remark_name" not in columns:
        op.add_column(
            "miscellaneous_remarks",
            sa.Column("remark_name", sa.String(255), nullable=True),
        )
    if "remark" not in columns:
        op.add_column(
            "miscellaneous_remarks",
            sa.Column("remark", sa.Text(), nullable=True),
        )
    if "amount" not in columns:
        op.add_column(
            "miscellaneous_remarks",
            sa.Column("amount", sa.DECIMAL(12, 2), nullable=True),
        )
    if "status" not in columns:
        op.add_column(
            "miscellaneous_remarks",
            sa.Column("status", sa.String(50), nullable=False, server_default="Active"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    columns = {column["name"] for column in sa.inspect(bind).get_columns("miscellaneous_remarks")}
    if "amount" in columns:
        op.drop_column("miscellaneous_remarks", "amount")
    if "remark" in columns:
        op.drop_column("miscellaneous_remarks", "remark")
    if "remark_name" in columns:
        op.drop_column("miscellaneous_remarks", "remark_name")
    if "status" in columns:
        op.drop_column("miscellaneous_remarks", "status")
