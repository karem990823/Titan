from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class DetalleFacturaBase(BaseModel):
    descripcion: str = Field(min_length=1)
    valor: Decimal = Field(gt=0)


class DetalleFacturaCreate(DetalleFacturaBase):
    pass


class DetalleFacturaUpdate(BaseModel):
    descripcion: Optional[str] = Field(default=None, min_length=1)
    valor: Optional[Decimal] = Field(default=None, gt=0)


class DetalleFacturaResponse(DetalleFacturaBase):
    id_detalle: int
    id_factura: int

    class Config:
        from_attributes = True
