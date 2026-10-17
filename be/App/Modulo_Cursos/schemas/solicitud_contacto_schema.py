from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SolicitudContactoCreate(BaseModel):
    nombre_contacto: str = Field(min_length=1)
    empresa: str = Field(min_length=1)
    correo: EmailStr
    telefono: str = Field(min_length=1)
    tipo_servicio: str = Field(min_length=1)
    numero_personal: Optional[int] = Field(default=None, gt=0)
    detalle: Optional[str] = None


class SolicitudContactoUpdate(BaseModel):
    atendida: bool


class SolicitudContactoResponse(BaseModel):
    id_solicitud: int
    nombre_contacto: str
    empresa: str
    correo: str
    telefono: str
    tipo_servicio: str
    numero_personal: Optional[int]
    detalle: Optional[str]
    atendida: bool

    class Config:
        from_attributes = True
