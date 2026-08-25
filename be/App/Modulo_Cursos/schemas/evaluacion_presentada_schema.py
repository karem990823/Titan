from datetime import date
from typing import List, Optional
from pydantic import BaseModel

from App.Modulo_Cursos.schemas.resultado_schema import ResultadoResponse


class RespuestaSeleccionada(BaseModel):
    id_pregunta: int
    id_respuesta: int


class PresentarEvaluacionRequest(BaseModel):
    id_usuario: int
    respuestas: List[RespuestaSeleccionada]


class EvaluacionPresentadaResponse(BaseModel):
    id_presentada: int
    id_usuario: int
    id_evaluacion: int
    fecha: date
    resultado: Optional[ResultadoResponse] = None

    class Config:
        from_attributes = True
