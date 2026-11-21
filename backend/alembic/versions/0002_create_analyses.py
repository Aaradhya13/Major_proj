"""create analyses table

Revision ID: 0002_create_analyses
Revises: 0001_create_users
Create Date: 2026-09-21
"""
from alembic import op
import sqlalchemy as sa


revision = "0002_create_analyses"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analyses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("analysis_id", sa.String(length=80), nullable=False),
        sa.Column("patient_id", sa.String(length=80), nullable=False),
        sa.Column("patient_name", sa.String(length=160), nullable=False),
        sa.Column("mri_filename", sa.String(length=255), nullable=False),
        sa.Column("mri_path", sa.String(length=500), nullable=False),
        sa.Column("final_prediction", sa.String(length=160), nullable=False),
        sa.Column("stage1_prediction", sa.String(length=80), nullable=False),
        sa.Column("stage1_decision_score", sa.Float(), nullable=False),
        sa.Column("stage2_prediction", sa.String(length=80), nullable=True),
        sa.Column("stage2_decision_score", sa.Float(), nullable=True),
        sa.Column("analysis_date", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("status", sa.String(length=40), nullable=False),
        sa.Column("clinical_notes", sa.Text(), nullable=True),
        sa.Column("gradcam_path", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_analyses_analysis_id"), "analyses", ["analysis_id"], unique=True)
    op.create_index(op.f("ix_analyses_patient_id"), "analyses", ["patient_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_analyses_patient_id"), table_name="analyses")
    op.drop_index(op.f("ix_analyses_analysis_id"), table_name="analyses")
    op.drop_table("analyses")