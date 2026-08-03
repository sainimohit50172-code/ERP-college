"""Add COE exam form preference and header/footer tables.

Revision ID: f3a7c9d1e2b4
Revises: b1f2c3d4e5f6, d2fb9c4ff0a1
"""

from alembic import op
import sqlalchemy as sa

revision = "f3a7c9d1e2b4"
down_revision = ("b1f2c3d4e5f6", "d2fb9c4ff0a1")
branch_labels = None
depends_on = None


def _index_if_missing(bind, name, table, columns):
    inspector = sa.inspect(bind)
    if name not in {index["name"] for index in inspector.get_indexes(table)}:
        op.create_index(name, table, columns)


def upgrade() -> None:
    bind = op.get_bind()
    tables = set(sa.inspect(bind).get_table_names())
    if "exam_form_preferences" not in tables:
        op.create_table(
            "exam_form_preferences",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("academic_session", sa.String(64), nullable=False),
            sa.Column("institute", sa.String(160), nullable=False),
            sa.Column("course", sa.String(160), nullable=False),
            sa.Column("program", sa.String(160), nullable=True),
            sa.Column("semester", sa.String(64), nullable=False),
            sa.Column("exam_type", sa.String(128), nullable=False),
            sa.Column("form_opening_date", sa.Date(), nullable=False),
            sa.Column("form_closing_date", sa.Date(), nullable=False),
            sa.Column("late_fee_date", sa.Date(), nullable=True),
            sa.Column("late_fee_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
            sa.Column("without_late_fee", sa.Boolean(), nullable=False, server_default=sa.text("1")),
            sa.Column("with_late_fee", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("maximum_subjects", sa.Integer(), nullable=False, server_default="8"),
            sa.Column("minimum_subjects", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("allow_improvement", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("allow_back_paper", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("allow_reappear", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("allow_practical_only", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("allow_theory_only", sa.Boolean(), nullable=False, server_default=sa.text("0")),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.Column("created_by", sa.String(128), nullable=True),
            sa.Column("created_date", sa.Date(), nullable=False),
            sa.Column("updated_by", sa.String(128), nullable=True),
            sa.Column("updated_date", sa.Date(), nullable=True),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    if "exam_form_headers_footers" not in tables:
        op.create_table(
            "exam_form_headers_footers",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("header_name", sa.String(160), nullable=False),
            sa.Column("header_html", sa.Text(), nullable=False),
            sa.Column("footer_html", sa.Text(), nullable=False),
            sa.Column("institute", sa.String(160), nullable=False),
            sa.Column("exam_type", sa.String(128), nullable=False),
            sa.Column("logo", sa.String(500), nullable=True),
            sa.Column("watermark", sa.String(500), nullable=True),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("created_by", sa.String(128), nullable=True),
            sa.Column("created_date", sa.Date(), nullable=False),
            sa.Column("updated_by", sa.String(128), nullable=True),
            sa.Column("updated_date", sa.Date(), nullable=True),
            sa.Column("deleted_at", sa.DateTime(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    _index_if_missing(bind, "ix_exam_form_preferences_session_institute_course", "exam_form_preferences", ["academic_session", "institute", "course"])
    _index_if_missing(bind, "ix_exam_form_preferences_exam_type_status", "exam_form_preferences", ["exam_type", "status"])
    _index_if_missing(bind, "ix_exam_form_headers_footers_institute_exam_type", "exam_form_headers_footers", ["institute", "exam_type"])
    _index_if_missing(bind, "ix_exam_form_headers_footers_status", "exam_form_headers_footers", ["status"])


def downgrade() -> None:
    op.drop_table("exam_form_headers_footers")
    op.drop_table("exam_form_preferences")
