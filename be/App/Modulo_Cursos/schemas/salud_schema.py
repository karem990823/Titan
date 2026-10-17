from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel


class SaludBase(BaseModel):
    apto: Literal["SI", "NO"]
    restricciones: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_examen: date
    fecha_vencimiento: date
    id_trabajador: int


class SaludCreate(SaludBase):
    pass


class SaludUpdate(BaseModel):
    apto: Optional[Literal["SI", "NO"]] = None
    restricciones: Optional[str] = None
    observaciones: Optional[str] = None
    fecha_examen: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    id_trabajador: Optional[int] = None


class SaludResponse(SaludBase):
    id_salud: int

    class Config:
        from_attributes = True
