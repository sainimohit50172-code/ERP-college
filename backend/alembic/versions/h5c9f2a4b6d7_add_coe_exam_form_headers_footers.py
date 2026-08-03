"""Add configuration-only COE exam form header/footer templates.

Revision ID: h5c9f2a4b6d7
Revises: g4b8e1c2d3f5
"""

from alembic import op
import sqlalchemy as sa

revision = "h5c9f2a4b6d7"
down_revision = "g4b8e1c2d3f5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    if "coe_exam_form_headers_footers" not in sa.inspect(bind).get_table_names():
        op.create_table(
            "coe_exam_form_headers_footers",
            sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
            sa.Column("institute_id", sa.BigInteger(), nullable=False),
            sa.Column("exam_type_id", sa.BigInteger(), nullable=False),
            sa.Column("section_type", sa.String(16), nullable=False),
            sa.Column("template_type", sa.String(16), nullable=False),
            sa.Column("html_content", sa.Text(), nullable=False),
            sa.Column("status", sa.String(32), nullable=False, server_default="Active"),
            sa.Column("created_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("updated_by", sa.BigInteger(), sa.ForeignKey("users.id"), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        )
    inspector = sa.inspect(bind)
    indexes = {index["name"] for index in inspector.get_indexes("coe_exam_form_headers_footers")}
    if "uq_coe_exam_form_headers_footers_slot" not in indexes:
        op.create_index("uq_coe_exam_form_headers_footers_slot", "coe_exam_form_headers_footers", ["institute_id", "exam_type_id", "section_type", "template_type"], unique=True)
    if "ix_coe_exam_form_headers_footers_status" not in indexes:
        op.create_index("ix_coe_exam_form_headers_footers_status", "coe_exam_form_headers_footers", ["status"])


def downgrade() -> None:
    # Preserve configured templates during downgrade operations.
    pass
