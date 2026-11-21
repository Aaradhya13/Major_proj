from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.patient import Patient
from app.models.user import User


DEMO_EMAIL = "sarah.mitchell@neurovision.ai"
DEMO_PASSWORD = "NeuroVision123!"
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


def seed_demo_user() -> None:
    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == DEMO_EMAIL))
        if user is None:
            db.add(
                User(
                    name="Dr. Sarah Mitchell",
                    email=DEMO_EMAIL,
                    password_hash=hash_password(DEMO_PASSWORD),
                    role="Neurology Department",
                )
            )
            db.commit()
            print(f"Created DEVELOPMENT/DEMO user: {DEMO_EMAIL}")
        else:
            print(f"DEVELOPMENT/DEMO user already exists: {DEMO_EMAIL}")


def seed_development_patients() -> None:
    with SessionLocal() as db:
        for patient_id, name, age, gender in SEED_PATIENTS:
            patient = db.scalar(select(Patient).where(Patient.patient_id == patient_id))
            if patient is None:
                db.add(Patient(patient_id=patient_id, name=name, age=age, gender=gender))
        db.commit()
        print(f"Development patient seed complete: {len(SEED_PATIENTS)} records")


if __name__ == "__main__":
    seed_demo_user()
    seed_development_patients()