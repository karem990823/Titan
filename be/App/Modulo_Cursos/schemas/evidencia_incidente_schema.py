from datetime import datetime
from pydantic import BaseModel


class EvidenciaIncidenteResponse(BaseModel):
    id_evidencia: int
    id_accidente: int
    nombre: str
    tipo: str
    fecha_subida: datetime

    class Config:
        from_attributes = True
