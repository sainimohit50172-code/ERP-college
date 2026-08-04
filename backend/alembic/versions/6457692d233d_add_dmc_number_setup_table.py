"""Add DMC Number Setup table.
Revision ID: 6457692d233d
Revises: p1q2w3e4r5t6
Create Date: 2026-08-04 14:12:51.609202
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6457692d233d'
down_revision = 'p1q2w3e4r5t6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the DMC Number Setup table
    op.create_table(
        'coe_dmc_number_setup',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('series_name', sa.String(length=160), nullable=False),
        sa.Column('prefix', sa.String(length=32), nullable=True),
        sa.Column('starting_number', sa.Integer(), nullable=False),
        sa.Column('ending_number', sa.Integer(), nullable=False),
        sa.Column('current_number', sa.Integer(), nullable=False),
        sa.Column('digit_length', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('created_by', sa.BigInteger(), nullable=True),
        sa.Column('updated_by', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coe_dmc_number_setup_series_name'), 'coe_dmc_number_setup', ['series_name'], unique=False)
    op.create_index(op.f('ix_coe_dmc_number_setup_status'), 'coe_dmc_number_setup', ['status'], unique=False)
    op.create_index(op.f('ix_coe_dmc_number_setup_deleted_at'), 'coe_dmc_number_setup', ['deleted_at'], unique=False)


def downgrade() -> None:
    # Drop indices
    op.drop_index(op.f('ix_coe_dmc_number_setup_deleted_at'), table_name='coe_dmc_number_setup')
    op.drop_index(op.f('ix_coe_dmc_number_setup_status'), table_name='coe_dmc_number_setup')
    op.drop_index(op.f('ix_coe_dmc_number_setup_series_name'), table_name='coe_dmc_number_setup')
    # Drop the table
    op.drop_table('coe_dmc_number_setup')
