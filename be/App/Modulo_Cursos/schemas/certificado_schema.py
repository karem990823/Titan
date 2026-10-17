from pydantic import BaseModel
from datetime import date

class CertificadoBase(BaseModel):
    codigo: str
    fecha_emision: date
    fecha_vencimiento: date
    id_usuario: int
    id_curso: int

class CertificadoResponse(CertificadoBase):
    id_certificado: int

    class Config:
        from_attributes = True