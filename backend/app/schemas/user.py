"""
Schemas de Usuario.
"""

from pydantic import BaseModel, EmailStr, field_validator
import re


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    dni: str
    password: str
    gender: str = "O" # Default to Other if not specified, or force frontend to send it
    role: str = "user"

    @field_validator('dni')
    @classmethod
    def validate_dni(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError('El DNI debe contener solo números')
        if not (7 <= len(v) <= 8):
            raise ValueError('El DNI debe tener entre 7 y 8 dígitos')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('La contraseña debe tener al menos 8 caracteres')
        return v

    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError('El nombre debe tener al menos 3 caracteres')
        return v


class UserResponse(UserBase):
    id: int
    dni: str
    role: str
    is_active: bool
    cancellation_count: int = 0
    cancellation_count: int = 0
    reputation_score: int = 100
    
    # New Fields
    gender: str | None = None
    is_verified: bool = False
    verification_status: str = "unverified"
    car_model: str | None = None
    car_plate: str | None = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    dni: str
    password: str
    role: str = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


