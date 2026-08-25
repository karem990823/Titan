from typing import List, Optional
from pydantic import BaseModel

from App.Modulo_Cursos.schemas.pregunta_schema import (
    PreguntaCreate,
    PreguntaDetalleResponse,
    PreguntaParaPresentarResponse
)


class EvaluacionBase(BaseModel):
    nombre: str


class EvaluacionCreate(EvaluacionBase):
    preguntas: Optional[List[PreguntaCreate]] = None


class EvaluacionUpdate(BaseModel):
    nombre: Optional[str] = None


class EvaluacionResponse(EvaluacionBase):
    id_evaluacion: int

    class Config:
        from_attributes = True


class EvaluacionDetalleResponse(EvaluacionResponse):
    """Vista completa, con respuestas correctas marcadas (uso administrativo)."""
    preguntas: List[PreguntaDetalleResponse] = []


class EvaluacionParaPresentarResponse(EvaluacionResponse):
    """Vista para el usuario que va a presentar el examen, sin revelar la respuesta correcta."""
    preguntas: List[PreguntaParaPresentarResponse] = []
