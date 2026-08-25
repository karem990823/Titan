from decimal import Decimal
from typing import Optional
from pydantic import BaseModel


class DetalleFacturaBase(BaseModel):
    descripcion: str
    valor: Decimal


class DetalleFacturaCreate(DetalleFacturaBase):
    pass


class DetalleFacturaUpdate(BaseModel):
    descripcion: Optional[str] = None
    valor: Optional[Decimal] = None


class DetalleFacturaResponse(DetalleFacturaBase):
    id_detalle: int
    id_factura: int

    class Config:
        from_attributes = True
