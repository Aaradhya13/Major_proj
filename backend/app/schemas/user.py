from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr


class PasswordChange(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)