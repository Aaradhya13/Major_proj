"""create doctor reviews

Revision ID: 0004_create_doctor_reviews
Revises: 0003_create_patients
Create Date: 2026-09-25
"""
from alembic import op
import sqlalchemy as sa


revision = "0004_create_doctor_reviews"
down_revision = "0003_create_patients"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "doctor_reviews",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("analysis_id", sa.String(length=80), nullable=False),
        sa.Column("doctor_id", sa.Integer(), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False),
        sa.Column("remarks", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["analysis_id"], ["analyses.analysis_id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["doctor_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("analysis_id", "doctor_id", name="uq_doctor_reviews_analysis_doctor"),
    )
    op.create_index(op.f("ix_doctor_reviews_analysis_id"), "doctor_reviews", ["analysis_id"], unique=False)
    op.create_index(op.f("ix_doctor_reviews_doctor_id"), "doctor_reviews", ["doctor_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_doctor_reviews_doctor_id"), table_name="doctor_reviews")
    op.drop_index(op.f("ix_doctor_reviews_analysis_id"), table_name="doctor_reviews")
    op.drop_table("doctor_reviews")
