from datetime import date, datetime
from pydantic import BaseModel


class ReporteResponse(BaseModel):
    id_reporte: int
    tipo: str
    fecha: date
    contenido_json: str
    generado_por: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True
