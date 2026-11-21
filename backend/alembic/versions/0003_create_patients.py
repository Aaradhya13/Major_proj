"""create patients and link analyses

Revision ID: 0003_create_patients
Revises: 0002_create_analyses
Create Date: 2026-09-21
"""
from alembic import op
import sqlalchemy as sa


revision = "0003_create_patients"
down_revision = "0002_create_analyses"
branch_labels = None
depends_on = None

SEED_PATIENTS = [
    ("NV-2026-0184", "Eleanor Bennett", 71, "Female"),
    ("NV-2026-0179", "Robert Campbell", 68, "Male"),
    ("NV-2026-0175", "Margaret Wilson", 64, "Female"),
    ("NV-2026-0168", "Thomas Anderson", 76, "Male"),
    ("NV-2026-0161", "Dorothy Harris", 70, "Female"),
    ("NV-2026-0156", "Michael Johnson", 73, "Male"),
    ("NV-2026-0149", "Patricia Moore", 67, "Female"),
    ("NV-2026-0142", "William Taylor", 79, "Male"),
]


def upgrade() -> None:
    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(length=40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_patients_patient_id"), "patients", ["patient_id"], unique=True)
    patients_table = sa.table("patients", sa.column("patient_id", sa.String), sa.column("name", sa.String), sa.column("age", sa.Integer), sa.column("gender", sa.String))
    op.bulk_insert(patients_table, [{"patient_id": pid, "name": name, "age": age, "gender": gender} for pid, name, age, gender in SEED_PATIENTS])
    for old_id, new_id in [("patient-0184", "NV-2026-0184"), ("patient-0179", "NV-2026-0179"), ("patient-0175", "NV-2026-0175"), ("patient-0168", "NV-2026-0168"), ("patient-0161", "NV-2026-0161"), ("patient-0156", "NV-2026-0156"), ("patient-0149", "NV-2026-0149"), ("patient-0142", "NV-2026-0142")]:
        op.execute(sa.text("UPDATE analyses SET patient_id = :new_id WHERE patient_id = :old_id").bindparams(old_id=old_id, new_id=new_id))
    op.create_foreign_key("fk_analyses_patient_id", "analyses", "patients", ["patient_id"], ["patient_id"])


def downgrade() -> None:
    op.drop_constraint("fk_analyses_patient_id", "analyses", type_="foreignkey")
    op.drop_index(op.f("ix_patients_patient_id"), table_name="patients")
    op.drop_table("patients")