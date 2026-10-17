from typing import Optional
from pydantic import BaseModel


class RespuestaBase(BaseModel):
    respuesta: str
    es_correcta: bool


class RespuestaCreate(RespuestaBase):
    pass


class RespuestaUpdate(BaseModel):
    respuesta: Optional[str] = None
    es_correcta: Optional[bool] = None


class RespuestaResponse(RespuestaBase):
    id_respuesta: int
    id_pregunta: int

    class Config:
        from_attributes = True


class RespuestaPublica(BaseModel):
    """Versión sin es_correcta, para mostrarle la pregunta al usuario que presenta."""
    id_respuesta: int
    respuesta: str

    class Config:
        from_attributes = True
