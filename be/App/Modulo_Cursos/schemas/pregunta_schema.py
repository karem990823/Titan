from typing import List, Optional
from pydantic import BaseModel

from App.Modulo_Cursos.schemas.respuesta_schema import (
    RespuestaCreate,
    RespuestaResponse,
    RespuestaPublica
)


class PreguntaBase(BaseModel):
    pregunta: str


class PreguntaCreate(PreguntaBase):
    respuestas: Optional[List[RespuestaCreate]] = None


class PreguntaUpdate(BaseModel):
    pregunta: Optional[str] = None


class PreguntaResponse(PreguntaBase):
    id_pregunta: int
    id_evaluacion: int

    class Config:
        from_attributes = True


class PreguntaDetalleResponse(PreguntaResponse):
    respuestas: List[RespuestaResponse] = []


class PreguntaParaPresentarResponse(PreguntaResponse):
    respuestas: List[RespuestaPublica] = []
