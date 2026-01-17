"""
Schemas de Usuario.
"""

from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional
import re


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    dni: str
    password: str
    gender: str = "O" 
    role: str = "user"
    
    # Extended
    birth_date: Optional[date] = None
    address: Optional[str] = None
    
    # Driver Specific
    car_model: Optional[str] = None
    car_plate: Optional[str] = None
    car_color: Optional[str] = None
    prefs_smoking: bool = False
    prefs_pets: bool = False
    prefs_luggage: bool = True

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

    reputation_score: int = 100
    
    # New Fields
    gender: str | None = None
    is_verified: bool = False
    verification_status: str = "unverified"
    car_model: str | None = None
    car_plate: str | None = None
    car_color: str | None = None
    
    # Extended
    birth_date: date | None = None
    age: int | None = None # Calculated
    address: str | None = None
    
    prefs_smoking: bool = False
    prefs_pets: bool = False
    prefs_luggage: bool = True

    class Config:
        from_attributes = True

    @field_validator('age', mode='before')
    @classmethod
    def calculate_age(cls, v, values):
        # Si 'age' ya viene, lo usamos. Si no, calculamos desde birth_date
        # Nota: 'values' en Pydantic v2 es diferente, pero en v1 usabamos values.get('birth_date')
        # Si estamos mapeando desde ORM, el objeto ORM tiene birth_date.
        # Pydantic from_attributes (orm_mode) a veces necesita un property en el modelo o un validator aqui.
        # Vamos a intentar calcularlo si v es None y tenemos birth_date en validation info?
        # Simplificación: Pydantic v2 es estricto. Mejor definimos age como property en el modelo o lo dejamos opcional.
        # Haremos que el modelo User tenga una property 'age' o simplemente devolvemos birth_date y el frontend calcula.
        # Pero el requerimiento decia "automaticamente mostrar la edad".
        # Vamos a dejar que el frontend calcule la edad con el birth_date por ahora para evitar complejidad de serializacion.
        pass


class UserLogin(BaseModel):
    dni: str
    password: str
    role: str = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


