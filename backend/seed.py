from sqlalchemy import select

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User


DEMO_EMAIL = "sarah.mitchell@neurovision.ai"
DEMO_PASSWORD = "NeuroVision123!"


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


if __name__ == "__main__":
    seed_demo_user()