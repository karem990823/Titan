from datetime import date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class PagoBase(BaseModel):
    fecha: date
    monto: Decimal
    id_factura: int
    id_metodo: int


class PagoCreate(PagoBase):
    pass


class PagoUpdate(BaseModel):
    fecha: Optional[date] = None
    monto: Optional[Decimal] = None
    id_metodo: Optional[int] = None


class PagoResponse(PagoBase):
    id_pago: int

    class Config:
        from_attributes = True
