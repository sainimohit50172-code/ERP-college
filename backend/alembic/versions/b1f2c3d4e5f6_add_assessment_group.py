"""Add assessment_group and assessment_group_items tables
Revision ID: b1f2c3d4e5f6
Revises: 46e7886742ac
Create Date: 2026-07-25 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b1f2c3d4e5f6'
down_revision = '46e7886742ac'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    if 'assessment_group' not in tables:
        op.create_table(
            'assessment_group',
            sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
            sa.Column('name', sa.String(length=255), nullable=False),
            sa.Column('college_id', sa.BigInteger, sa.ForeignKey('departments.id'), nullable=True),
            sa.Column('course_id', sa.BigInteger, sa.ForeignKey('courses.id'), nullable=True),
            sa.Column('batch_id', sa.BigInteger, sa.ForeignKey('academic_classes.id'), nullable=True),
            sa.Column('grade_setup_id', sa.BigInteger, sa.ForeignKey('assessment_grade_setups.id'), nullable=True),
            sa.Column('weightage', sa.Float, nullable=True),
            sa.Column('edit_result', sa.Boolean, nullable=False, server_default=sa.text('0')),
            sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        )

    if 'assessment_group_items' not in tables:
        op.create_table(
            'assessment_group_items',
            sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
            sa.Column('assessment_group_id', sa.BigInteger, sa.ForeignKey('assessment_group.id', ondelete='CASCADE'), nullable=False),
            sa.Column('assessment_name', sa.String(length=255), nullable=False),
            sa.Column('assessment_model', sa.String(length=64), nullable=True),
            sa.Column('display_name', sa.String(length=255), nullable=True),
            sa.Column('sequence_no', sa.Integer, nullable=True),
            sa.Column('result_declared', sa.Boolean, nullable=False, server_default=sa.text('0')),
            sa.Column('include_in_total', sa.Boolean, nullable=False, server_default=sa.text('0')),
            sa.Column('display_value', sa.Boolean, nullable=False, server_default=sa.text('0')),
            sa.Column('show_graph', sa.Boolean, nullable=False, server_default=sa.text('0')),
            sa.Column('passing_required', sa.Boolean, nullable=False, server_default=sa.text('0')),
        )


def downgrade() -> None:
    op.drop_table('assessment_group_items')
    op.drop_table('assessment_group')
