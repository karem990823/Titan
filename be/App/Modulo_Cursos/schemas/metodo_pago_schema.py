from typing import Optional
from pydantic import BaseModel, Field


class MetodoPagoBase(BaseModel):
    nombre: str = Field(min_length=1)


class MetodoPagoCreate(MetodoPagoBase):
    pass


class MetodoPagoUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=1)


class MetodoPagoResponse(MetodoPagoBase):
    id_metodo: int

    class Config:
        from_attributes = True
