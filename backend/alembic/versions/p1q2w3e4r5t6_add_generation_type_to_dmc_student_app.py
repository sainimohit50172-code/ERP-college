"""Add generation_type column to DMC student app table when missing.

Revision ID: p1q2w3e4r5t6
Revises: o7p8q9r0s1t2
"""

from alembic import op
import sqlalchemy as sa

revision = "p1q2w3e4r5t6"
down_revision = "o7p8q9r0s1t2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "dmc_student_app" not in inspector.get_table_names():
        return

    columns = [column["name"] for column in inspector.get_columns("dmc_student_app")]
    if "generation_type" not in columns:
        op.add_column(
            "dmc_student_app",
            sa.Column("generation_type", sa.String(32), nullable=False, server_default="Sequence"),
        )
        op.execute("UPDATE dmc_student_app SET generation_type='Sequence' WHERE generation_type IS NULL")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "dmc_student_app" not in inspector.get_table_names():
        return

    columns = [column["name"] for column in inspector.get_columns("dmc_student_app")]
    if "generation_type" in columns:
        op.drop_column("dmc_student_app", "generation_type")
