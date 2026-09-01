from datetime import date
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel

from App.Modulo_Cursos.schemas.detalle_factura_schema import DetalleFacturaCreate, DetalleFacturaResponse


class FacturaBase(BaseModel):
    fecha: date
    id_empresa: int
    numero_factura_externa: Optional[str] = None


class FacturaCreate(FacturaBase):
    detalles: Optional[List[DetalleFacturaCreate]] = None


class FacturaUpdate(BaseModel):
    fecha: Optional[date] = None
    id_empresa: Optional[int] = None
    numero_factura_externa: Optional[str] = None


class FacturaResponse(FacturaBase):
    id_factura: int

    class Config:
        from_attributes = True


class FacturaDetalleResponse(FacturaResponse):
    detalles: List[DetalleFacturaResponse] = []
    total: Decimal
    saldo_pendiente: Decimal
