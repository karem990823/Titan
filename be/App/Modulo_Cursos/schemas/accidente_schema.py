from datetime import date
from typing import Optional
from pydantic import BaseModel


class AccidenteBase(BaseModel):
    fecha: date
    lugar: str
    id_trabajador: int
    id_tipo_accidente: int
    descripcion: Optional[str] = None


class AccidenteCreate(AccidenteBase):
    pass


class AccidenteUpdate(BaseModel):
    fecha: Optional[date] = None
    lugar: Optional[str] = None
    id_trabajador: Optional[int] = None
    id_tipo_accidente: Optional[int] = None
    descripcion: Optional[str] = None


class AccidenteResponse(AccidenteBase):
    id_accidente: int

    class Config:
        from_attributes = True
