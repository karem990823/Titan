from decimal import Decimal
from pydantic import BaseModel


class ResultadoResponse(BaseModel):
    id_resultado: int
    id_presentada: int
    puntaje: Decimal

    class Config:
        from_attributes = True
