"""Add COE exam form preference settings and ID-based records.

Revision ID: g4b8e1c2d3f5
Revises: f3a7c9d1e2b4
"""

from alembic import op
import sqlalchemy as sa

revision = "g4b8e1c2d3f5"
down_revision = "f3a7c9d1e2b4"
branch_labels = None
depends_on = None


def _index_if_missing(bind, name, table, columns, unique=False):
    inspector = sa.inspect(bind)
    if name not in {index["name"] for index in inspector.get_indexes(table)}:
        op.create_index(name, table, columns, unique=unique)


def upgrade() -> None:
    bind = op.get_bind()
    tables = set(sa.inspect(bind).get_table_names())
    if "coe_exam_form_preference_settings" not in tables:
        op.create_table(
            "coe_exam_form_preference_settings",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("student_awake_status", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("auto_approve", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("personal_details_check", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    if "coe_exam_form_preferences" not in tables:
        op.create_table(
            "coe_exam_form_preferences",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("academic_session_id", sa.BigInteger(), sa.ForeignKey("academic_years.id"), nullable=False),
            sa.Column("institute_id", sa.BigInteger(), nullable=False),
            sa.Column("course_id", sa.BigInteger(), sa.ForeignKey("courses.id"), nullable=False),
            sa.Column("program_id", sa.BigInteger(), nullable=False),
            sa.Column("semester_id", sa.BigInteger(), sa.ForeignKey("semesters.id"), nullable=False),
            sa.Column("exam_type_id", sa.BigInteger(), nullable=False),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    _index_if_missing(bind, "uq_coe_exam_form_preferences_combination", "coe_exam_form_preferences", ["academic_session_id", "institute_id", "course_id", "program_id", "semester_id", "exam_type_id"], unique=True)
    _index_if_missing(bind, "ix_coe_exam_form_preferences_status", "coe_exam_form_preferences", ["status"])


def downgrade() -> None:
    # Keep production preference data intact during downgrade operations.
    pass
