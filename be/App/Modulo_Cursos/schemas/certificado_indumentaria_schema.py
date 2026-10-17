from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel


class CertificadoIndumentariaBase(BaseModel):
    id_indumentaria: int
    fecha_emision: date
    fecha_vencimiento: date
    estado: Literal['apto', 'no_apto']


class CertificadoIndumentariaCreate(CertificadoIndumentariaBase):
    pass


class CertificadoIndumentariaUpdate(BaseModel):
    id_indumentaria: Optional[int] = None
    fecha_emision: Optional[date] = None
    fecha_vencimiento: Optional[date] = None
    estado: Optional[Literal['apto', 'no_apto']] = None


class CertificadoIndumentariaResponse(CertificadoIndumentariaBase):
    id_certificado_equipo: int

    class Config:
        from_attributes = True
