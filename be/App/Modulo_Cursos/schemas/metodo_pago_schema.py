from typing import Optional
from pydantic import BaseModel


class MetodoPagoBase(BaseModel):
    nombre: str


class MetodoPagoCreate(MetodoPagoBase):
    pass


class MetodoPagoUpdate(BaseModel):
    nombre: Optional[str] = None


class MetodoPagoResponse(MetodoPagoBase):
    id_metodo: int

    class Config:
        from_attributes = True
