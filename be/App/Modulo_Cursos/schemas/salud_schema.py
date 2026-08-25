from pydantic import BaseModel
from datetime import date

class SaludBase(BaseModel):
    apto: str
    fecha_vencimiento: date
    id_trabajador: int

class SaludResponse(SaludBase):
    id_salud: int

    class Config:
        from_attributes = True