"""Add Miscellaneous Remark fields.

Revision ID: x9y0z1a2b3c4
Revises: w7x8y9z0a1b2
"""

from alembic import op
import sqlalchemy as sa

revision = "x9y0z1a2b3c4"
down_revision = "q1w2e3r4t5y6"
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
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("miscellaneous_remarks")}
    for column in ("status", "amount", "remark", "remark_name"):
        if column in columns:
            op.drop_column("miscellaneous_remarks", column)
