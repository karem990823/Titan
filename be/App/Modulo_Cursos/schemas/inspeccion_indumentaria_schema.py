from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel


class InspeccionIndumentariaBase(BaseModel):
    fecha: date
    id_indumentaria: int
    id_usuario: int
    observaciones: Optional[str] = None
    resultado: Literal["apto", "no_apto"]


class InspeccionIndumentariaCreate(InspeccionIndumentariaBase):
    pass


class InspeccionIndumentariaUpdate(BaseModel):
    fecha: Optional[date] = None
    id_indumentaria: Optional[int] = None
    id_usuario: Optional[int] = None
    observaciones: Optional[str] = None
    resultado: Optional[Literal["apto", "no_apto"]] = None


class InspeccionIndumentariaResponse(InspeccionIndumentariaBase):
    id_inspeccion: int

    class Config:
        from_attributes = True
